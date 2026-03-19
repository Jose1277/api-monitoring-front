'use client'

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Endpoint {
    id: string;
    name: string;
    url: string;
    method: string;
    headers?: Record<string, string> | null;
    body?: string | null;
    interval: number;
    timeout: number;
    isActive: boolean;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
    userId: string;
}

interface EndpointStatus {
    isUp: boolean;
    responseTime: number;
    lastCheck: string;
}

interface EndpointCardProps {
    endpoint: Endpoint;
}

export default function EndpointCard({ endpoint }: EndpointCardProps) {
    const [status, setStatus] = useState<EndpointStatus | null>(null);

    useEffect(() => {
        api.get<EndpointStatus>(`/endpoints/${endpoint.id}/status`)
            .then((res) => setStatus(res.data))
            .catch(() => setStatus(null));
    }, [endpoint.id]);

    const statusBadge = status === null
        ? { label: 'Pending', cls: 'bg-gray-100 text-gray-500' }
        : status.isUp
            ? { label: 'Up', cls: 'bg-green-100 text-green-700' }
            : { label: 'Down', cls: 'bg-red-100 text-red-600' };

    return (
        <div className="flex flex-col gap-2 p-4 rounded-xl border border-gray-200 bg-white shadow-sm h-34 overflow-hidden">
            <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="font-semibold text-gray-800 truncate" title={endpoint.name}>
                    {endpoint.name}
                </span>
                <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge.cls}`}>
                    {statusBadge.label}
                </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
                <span className="shrink-0 px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono text-xs font-bold">
                    {endpoint.method}
                </span>
                <span className="truncate" title={endpoint.url}>{endpoint.url}</span>
            </div>

            {endpoint.description && (
                <p className="text-xs text-gray-400 truncate" title={endpoint.description}>
                    {endpoint.description}
                </p>
            )}

            {status && (
                <div className="flex items-center justify-end mt-auto text-xs text-gray-500">
                    <span>{status.responseTime}ms</span>
                </div>
            )}
        </div>
    );
}
