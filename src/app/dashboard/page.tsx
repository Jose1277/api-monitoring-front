'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useWebSocket, CheckUpdatePayload } from '@/hooks/useWebSocket';
import StatusCard from '@/components/dashboard/StatusCard';
import IncidentList from '@/components/dashboard/IncidentList';
import Spinner from '@/components/ui/Spinner';

interface Endpoint {
    id: string;
    name: string;
    url: string;
    method: string;
    interval: number;
    timeout: number;
    isActive: boolean;
}

interface LiveUpdate {
    isUp: boolean;
    responseTime: number;
    checkedAt: Date;
}

export default function DashboardPage() {
    const { token, loading } = useAuthContext();
    const router = useRouter();
    const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
    const [fetching, setFetching] = useState(true);
    const [liveUpdates, setLiveUpdates] = useState<Record<string, LiveUpdate>>({});
    const [recentlyUpdated, setRecentlyUpdated] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!loading && !token) router.replace('/login');
    }, [token, loading, router]);

    useEffect(() => {
        if (!token) return;
        setFetching(true);
        api.get<Endpoint[]>('/endpoints')
            .then((r) => setEndpoints(r.data))
            .finally(() => setFetching(false));
    }, [token]);

    const handleCheckUpdate = useCallback((payload: CheckUpdatePayload) => {
        const update: LiveUpdate = {
            isUp: payload.isUp,
            responseTime: payload.responseTime,
            checkedAt: new Date(payload.checkedAt),
        };
        setLiveUpdates((prev) => ({ ...prev, [payload.endpointId]: update }));
        setRecentlyUpdated((prev) => ({ ...prev, [payload.endpointId]: true }));
        setTimeout(() => {
            setRecentlyUpdated((prev) => ({ ...prev, [payload.endpointId]: false }));
        }, 3000);
    }, []);

    useWebSocket(token, handleCheckUpdate);

    if (loading || !token) return null;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold tracking-widest text-white uppercase">Dashboard</h1>
                <span className="text-xs text-white/40">
                    {fetching ? '—' : `${endpoints.length} endpoint${endpoints.length !== 1 ? 's' : ''}`}
                </span>
            </div>

            {/* Status Cards */}
            {fetching ? (
                <div className="flex items-center justify-center py-24">
                    <Spinner size={32} className="text-fuchsia-400" />
                </div>
            ) : endpoints.length === 0 ? (
                <div
                    onClick={() => router.push('/endpoints')}
                    className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/15 p-16 cursor-pointer hover:border-fuchsia-400/40 hover:bg-white/5 transition-all duration-300"
                >
                    <span className="text-4xl text-white/20">+</span>
                    <p className="text-sm text-white/40">Add your first endpoint to start monitoring</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {endpoints.map((endpoint) => (
                        <StatusCard
                            key={endpoint.id}
                            endpoint={endpoint}
                            liveStatus={liveUpdates[endpoint.id] ?? null}
                            recentlyUpdated={recentlyUpdated[endpoint.id] ?? false}
                            onClick={() => router.push(`/endpoints/${endpoint.id}`)}
                        />
                    ))}
                    <div
                        onClick={() => router.push('/endpoints')}
                        className="flex items-center justify-center rounded-2xl border-2 border-dashed border-white/15 min-h-[140px] cursor-pointer hover:border-fuchsia-400/40 hover:bg-white/5 transition-all duration-300"
                    >
                        <span className="text-3xl text-white/20">+</span>
                    </div>
                </div>
            )}

            {/* Incidents */}
            {!fetching && endpoints.length > 0 && (
                <IncidentList endpoints={endpoints} />
            )}
        </div>
    );
}
