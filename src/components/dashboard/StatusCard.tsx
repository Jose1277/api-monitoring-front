'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Endpoint {
    id: string;
    name: string;
    url: string;
    method: string;
    interval: number;
    timeout: number;
}

interface Stats {
    uptimePercentage: number;
    averageResponseTime: number;
    lastCheck: { checkedAt: string; responseTime: number };
}

interface LiveStatus {
    isUp: boolean;
    responseTime: number;
    lastCheck: string;
}

interface StatusCardProps {
    endpoint: Endpoint;
    liveStatus?: { isUp: boolean; responseTime: number; checkedAt: Date } | null;
    recentlyUpdated?: boolean;
    onClick?: () => void;
}

function timeAgo(date: string | Date): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}

export default function StatusCard({ endpoint, liveStatus, recentlyUpdated, onClick }: StatusCardProps) {
    const [stats, setStats] = useState<Stats | null>(null);
    const [status, setStatus] = useState<LiveStatus | null>(null);

    useEffect(() => {
        api.get<LiveStatus>(`/endpoints/${endpoint.id}/status`)
            .then((r) => setStatus(r.data))
            .catch(() => setStatus(null));

        api.get<Stats>(`/health-checks/endpoint/${endpoint.id}/stats`)
            .then((r) => setStats(r.data))
            .catch(() => setStats(null));
    }, [endpoint.id]);

    useEffect(() => {
        if (!liveStatus) return;
        setStatus({
            isUp: liveStatus.isUp,
            responseTime: liveStatus.responseTime,
            lastCheck: liveStatus.checkedAt.toString(),
        });
        if (stats) {
            setStats((prev) => prev
                ? { ...prev, averageResponseTime: liveStatus.responseTime }
                : prev
            );
        }
    }, [liveStatus]);

    const isUp = status?.isUp ?? null;

    return (
        <div
            onClick={onClick}
            className={`relative flex flex-col gap-3 rounded-2xl border bg-white/8 p-5 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.25)] transition-all duration-300 ${
                recentlyUpdated ? 'ring-2 ring-fuchsia-400/50' : 'border-white/10'
            } ${onClick ? 'cursor-pointer hover:bg-white/12 hover:border-white/20' : ''}`}
        >
            {recentlyUpdated && (
                <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-fuchsia-400 animate-ping" />
            )}

            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="truncate font-semibold text-white text-sm" title={endpoint.name}>
                        {endpoint.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                            {endpoint.method}
                        </span>
                        <span className="text-xs text-white/40 truncate" title={endpoint.url}>
                            {endpoint.url}
                        </span>
                    </div>
                </div>

                <div className={`flex items-center gap-1.5 shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                    isUp === null
                        ? 'bg-white/10 text-white/40'
                        : isUp
                            ? 'bg-green-500/15 text-green-400'
                            : 'bg-red-500/15 text-red-400'
                }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                        isUp === null ? 'bg-white/30' : isUp ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    {isUp === null ? 'Pending' : isUp ? 'Up' : 'Down'}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white/5 px-2 py-2">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Uptime</p>
                    <p className={`text-sm font-semibold mt-0.5 ${
                        stats === null ? 'text-white/30' :
                        stats.uptimePercentage >= 99 ? 'text-green-400' :
                        stats.uptimePercentage >= 90 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                        {stats ? `${stats.uptimePercentage}%` : '—'}
                    </p>
                </div>
                <div className="rounded-xl bg-white/5 px-2 py-2">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Avg</p>
                    <p className="text-sm font-semibold text-white/80 mt-0.5">
                        {stats ? `${stats.averageResponseTime}ms` : status ? `${status.responseTime}ms` : '—'}
                    </p>
                </div>
                <div className="rounded-xl bg-white/5 px-2 py-2">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Last</p>
                    <p className="text-sm font-semibold text-white/80 mt-0.5">
                        {status ? timeAgo(status.lastCheck) : stats ? timeAgo(stats.lastCheck.checkedAt) : '—'}
                    </p>
                </div>
            </div>
        </div>
    );
}
