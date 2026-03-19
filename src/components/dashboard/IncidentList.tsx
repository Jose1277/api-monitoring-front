'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AlertTriangle } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

interface Endpoint {
    id: string;
    name: string;
}

interface Check {
    id: string;
    checkedAt: string;
    errorMessage?: string;
    errorType?: string;
    responseTime: number;
    statusCode?: number;
}

interface Incident extends Check {
    endpointName: string;
}

function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function IncidentList({ endpoints }: { endpoints: Endpoint[] }) {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (endpoints.length === 0) return;
        setLoading(true);

        Promise.allSettled(
            endpoints.map((ep) =>
                api.get<Check[]>(`/health-checks/endpoint/${ep.id}`)
                    .then((r) => r.data
                        .filter((c) => !(c as unknown as { isUp: boolean }).isUp)
                        .slice(0, 5)
                        .map((c) => ({ ...c, endpointName: ep.name }))
                    )
            )
        ).then((results) => {
            const all: Incident[] = results
                .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
                .sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime())
                .slice(0, 10);
            setIncidents(all);
        }).finally(() => setLoading(false));
    }, [endpoints]);

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
                <AlertTriangle size={14} className="text-red-400" />
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Recent Incidents</p>
                {incidents.length > 0 && (
                    <span className="ml-auto text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium">
                        {incidents.length}
                    </span>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Spinner size={20} className="text-white/40" />
                </div>
            ) : incidents.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-white/30">
                    No incidents — all endpoints are healthy
                </div>
            ) : (
                <ul className="divide-y divide-white/5">
                    {incidents.map((inc) => (
                        <li key={inc.id} className="flex items-start gap-3 px-5 py-3">
                            <span className="mt-0.5 shrink-0 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                                DOWN
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-white truncate">{inc.endpointName}</p>
                                <p className="text-xs text-white/40 truncate mt-0.5">
                                    {inc.errorMessage ?? (inc.statusCode ? `HTTP ${inc.statusCode}` : 'Unknown error')}
                                </p>
                            </div>
                            <span className="shrink-0 text-xs text-white/30 mt-0.5">{timeAgo(inc.checkedAt)}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
