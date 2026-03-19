'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import UptimeChart from '@/components/dashboard/UptimeChart';
import LatencyChart from '@/components/dashboard/LatencyChart';
import EndpointForm from '@/components/endpoints/EndpointForm';
import Spinner from '@/components/ui/Spinner';

interface Endpoint {
    id: string;
    name: string;
    url: string;
    method: string;
    description?: string | null;
    headers?: Record<string, string> | null;
    body?: string | null;
    interval: number;
    timeout: number;
    isActive: boolean;
    createdAt: string;
}

interface HealthCheck {
    id: string;
    checkedAt: string;
    isUp: boolean;
    responseTime: number;
    statusCode?: number;
    errorMessage?: string;
    errorType?: string;
}

interface Stats {
    uptimePercentage: number;
    averageResponseTime: number;
    totalChecks: number;
    successfulChecks: number;
    failedChecks: number;
}

const METHOD_COLORS: Record<string, string> = {
    GET: 'bg-blue-500/20 text-blue-300',
    POST: 'bg-green-500/20 text-green-300',
    PUT: 'bg-yellow-500/20 text-yellow-300',
    PATCH: 'bg-orange-500/20 text-orange-300',
    DELETE: 'bg-red-500/20 text-red-300',
};

function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
}

export default function EndpointDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { token, loading } = useAuthContext();
    const router = useRouter();
    const toast = useToast();

    const [endpoint, setEndpoint] = useState<Endpoint | null>(null);
    const [checks, setChecks] = useState<HealthCheck[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [fetching, setFetching] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!loading && !token) router.replace('/login');
    }, [token, loading, router]);

    useEffect(() => {
        if (!token || !id) return;
        setFetching(true);

        Promise.allSettled([
            api.get<Endpoint>(`/endpoints/${id}`),
            api.get<HealthCheck[]>(`/health-checks/endpoint/${id}`),
            api.get<Stats>(`/health-checks/endpoint/${id}/stats`),
        ]).then(([epRes, checksRes, statsRes]) => {
            if (epRes.status === 'fulfilled') setEndpoint(epRes.value.data);
            else { toast.error('Endpoint not found'); router.replace('/endpoints'); return; }
            if (checksRes.status === 'fulfilled') setChecks(checksRes.value.data);
            if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        }).finally(() => setFetching(false));
    }, [token, id]);

    const handleDelete = async () => {
        if (!endpoint) return;
        if (!confirm(`Delete "${endpoint.name}"? This cannot be undone.`)) return;
        setDeleting(true);
        try {
            await api.delete(`/endpoints/${id}`);
            toast.success(`"${endpoint.name}" deleted`);
            router.push('/endpoints');
        } catch {
            toast.error('Failed to delete endpoint');
            setDeleting(false);
        }
    };

    if (loading || !token) return null;

    if (fetching) {
        return (
            <div className="flex items-center justify-center py-32">
                <Spinner size={32} className="text-fuchsia-400" />
            </div>
        );
    }

    if (!endpoint) return null;

    return (
        <>
            <div className="space-y-6">
                {/* Back + actions */}
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setEditOpen(true)}
                            className="flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-2 text-xs font-medium tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                        >
                            <Pencil size={13} /> EDIT
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex items-center gap-1.5 rounded-xl border border-red-500/20 px-3 py-2 text-xs font-medium tracking-widest text-red-400 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-40"
                        >
                            {deleting ? <Spinner size={13} className="text-red-400" /> : <Trash2 size={13} />}
                            DELETE
                        </button>
                    </div>
                </div>

                {/* Endpoint header */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                    <div className="flex flex-wrap items-start gap-3">
                        <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${METHOD_COLORS[endpoint.method] ?? 'bg-white/10 text-white/60'}`}>
                            {endpoint.method}
                        </span>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-semibold text-white">{endpoint.name}</h1>
                            <p className="text-sm text-white/50 break-all mt-0.5">{endpoint.url}</p>
                            {endpoint.description && (
                                <p className="text-sm text-white/40 mt-2">{endpoint.description}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Uptime', value: stats ? `${stats.uptimePercentage}%` : '—', color: stats && stats.uptimePercentage >= 99 ? 'text-green-400' : stats && stats.uptimePercentage >= 90 ? 'text-yellow-400' : stats ? 'text-red-400' : 'text-white/60' },
                            { label: 'Avg Response', value: stats ? `${stats.averageResponseTime}ms` : '—', color: 'text-white/80' },
                            { label: 'Total Checks', value: stats ? String(stats.totalChecks) : '—', color: 'text-white/80' },
                            { label: 'Failures', value: stats ? String(stats.failedChecks) : '—', color: stats && stats.failedChecks > 0 ? 'text-red-400' : 'text-white/80' },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="rounded-xl bg-white/5 px-4 py-3 text-center">
                                <p className="text-[10px] uppercase tracking-widest text-white/40">{label}</p>
                                <p className={`text-lg font-semibold mt-1 ${color}`}>{value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-white/40">
                        <span>Interval: {endpoint.interval >= 60000 ? `${endpoint.interval / 60000}m` : `${endpoint.interval / 1000}s`}</span>
                        <span>Timeout: {endpoint.timeout / 1000}s</span>
                        <span>Added: {new Date(endpoint.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UptimeChart checks={checks} />
                    <LatencyChart checks={checks} />
                </div>

                {/* Health check history table */}
                <div>
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">Check History</h2>
                    {checks.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-10 text-center text-sm text-white/30">
                            No checks yet — first check will run within 30 seconds
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[520px]">
                                    <thead>
                                        <tr className="border-b border-white/10 text-left text-xs uppercase tracking-widest text-white/40">
                                            <th className="px-5 py-3">Time</th>
                                            <th className="px-5 py-3">Status</th>
                                            <th className="px-5 py-3">Code</th>
                                            <th className="px-5 py-3">Response</th>
                                            <th className="px-5 py-3">Error</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {checks.map((check, i) => (
                                            <tr
                                                key={check.id}
                                                className={`transition-colors hover:bg-white/5 ${i !== checks.length - 1 ? 'border-b border-white/5' : ''}`}
                                            >
                                                <td className="px-5 py-3 text-white/60 whitespace-nowrap">
                                                    {timeAgo(check.checkedAt)}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`flex items-center gap-1.5 text-xs font-medium w-fit px-2 py-0.5 rounded-full ${
                                                        check.isUp
                                                            ? 'bg-green-500/15 text-green-400'
                                                            : 'bg-red-500/15 text-red-400'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${check.isUp ? 'bg-green-400' : 'bg-red-400'}`} />
                                                        {check.isUp ? 'Up' : 'Down'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-white/60">
                                                    {check.statusCode ?? '—'}
                                                </td>
                                                <td className="px-5 py-3 text-white/60">
                                                    {check.responseTime}ms
                                                </td>
                                                <td className="px-5 py-3 text-white/40 text-xs max-w-[200px] truncate">
                                                    {check.errorMessage ?? '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {editOpen && (
                <EndpointForm
                    endpoint={endpoint}
                    onClose={() => setEditOpen(false)}
                    onSaved={(_isEdit, name) => {
                        setEditOpen(false);
                        toast.success(`"${name}" updated`);
                        api.get<Endpoint>(`/endpoints/${id}`).then((r) => setEndpoint(r.data));
                    }}
                />
            )}
        </>
    );
}
