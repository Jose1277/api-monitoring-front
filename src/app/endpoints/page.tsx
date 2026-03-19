'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
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
}

const METHOD_COLORS: Record<string, string> = {
    GET: 'bg-blue-500/20 text-blue-300',
    POST: 'bg-green-500/20 text-green-300',
    PUT: 'bg-yellow-500/20 text-yellow-300',
    PATCH: 'bg-orange-500/20 text-orange-300',
    DELETE: 'bg-red-500/20 text-red-300',
};

export default function EndpointsPage() {
    const { token, loading } = useAuthContext();
    const router = useRouter();
    const toast = useToast();

    const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
    const [fetching, setFetching] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Endpoint | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !token) router.replace('/login');
    }, [token, loading, router]);

    const fetchEndpoints = () => {
        setFetching(true);
        api.get<Endpoint[]>('/endpoints')
            .then((r) => setEndpoints(r.data))
            .catch(() => toast.error('Failed to load endpoints'))
            .finally(() => setFetching(false));
    };

    useEffect(() => {
        if (token) fetchEndpoints();
    }, [token]);

    const handleDelete = async (endpoint: Endpoint) => {
        if (!confirm(`Delete "${endpoint.name}"? This action cannot be undone.`)) return;
        setDeletingId(endpoint.id);
        try {
            await api.delete(`/endpoints/${endpoint.id}`);
            setEndpoints((prev) => prev.filter((e) => e.id !== endpoint.id));
            toast.success(`"${endpoint.name}" deleted`);
        } catch {
            toast.error('Failed to delete endpoint');
        } finally {
            setDeletingId(null);
        }
    };

    const handleSaved = (isEdit: boolean, name: string) => {
        setFormOpen(false);
        setEditing(null);
        fetchEndpoints();
        toast.success(isEdit ? `"${name}" updated` : `"${name}" added`);
    };

    if (loading || !token) return null;

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold tracking-widest text-white uppercase">Endpoints</h1>
                <button
                    onClick={() => { setEditing(null); setFormOpen(true); }}
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium tracking-widest text-white bg-[linear-gradient(90deg,#c026d3_0%,#7c3aed_100%)] shadow-[0_0_20px_rgba(192,38,211,0.4)] hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                >
                    <Plus size={15} />
                    ADD
                </button>
            </div>

            {fetching ? (
                <div className="flex items-center justify-center py-24">
                    <Spinner size={32} className="text-fuchsia-400" />
                </div>
            ) : endpoints.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/15 p-16">
                    <p className="text-sm text-white/40">No endpoints yet.</p>
                    <button
                        onClick={() => { setEditing(null); setFormOpen(true); }}
                        className="text-sm text-fuchsia-400 hover:text-fuchsia-300 transition-colors cursor-pointer"
                    >
                        Add your first endpoint
                    </button>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[640px]">
                            <thead>
                                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-widest text-white/40">
                                    <th className="px-5 py-3">Name</th>
                                    <th className="px-5 py-3">URL</th>
                                    <th className="px-5 py-3">Method</th>
                                    <th className="px-5 py-3">Interval</th>
                                    <th className="px-5 py-3">Timeout</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {endpoints.map((endpoint, i) => (
                                    <tr
                                        key={endpoint.id}
                                        className={`transition-colors hover:bg-white/5 ${i !== endpoints.length - 1 ? 'border-b border-white/5' : ''}`}
                                    >
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-white truncate max-w-[180px]" title={endpoint.name}>
                                                {endpoint.name}
                                            </p>
                                            {endpoint.description && (
                                                <p className="text-xs text-white/40 truncate max-w-[180px]">{endpoint.description}</p>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-white/60 truncate max-w-[220px] block" title={endpoint.url}>
                                                {endpoint.url}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${METHOD_COLORS[endpoint.method] ?? 'bg-white/10 text-white/60'}`}>
                                                {endpoint.method}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-white/60">
                                            {endpoint.interval >= 60000 ? `${endpoint.interval / 60000}m` : `${endpoint.interval / 1000}s`}
                                        </td>
                                        <td className="px-5 py-4 text-white/60">
                                            {endpoint.timeout / 1000}s
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => router.push(`/endpoints/${endpoint.id}`)}
                                                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                                                    title="View details"
                                                >
                                                    <ExternalLink size={14} />
                                                </button>
                                                <button
                                                    onClick={() => { setEditing(endpoint); setFormOpen(true); }}
                                                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                                                    title="Edit"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(endpoint)}
                                                    disabled={deletingId === endpoint.id}
                                                    className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-40"
                                                    title="Delete"
                                                >
                                                    {deletingId === endpoint.id
                                                        ? <Spinner size={14} className="text-red-400" />
                                                        : <Trash2 size={14} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {formOpen && (
                <EndpointForm
                    endpoint={editing}
                    onClose={() => { setFormOpen(false); setEditing(null); }}
                    onSaved={handleSaved}
                />
            )}
        </>
    );
}
