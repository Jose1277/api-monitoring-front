'use client';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell,
} from 'recharts';

interface Check {
    checkedAt: string;
    isUp: boolean;
    responseTime: number;
}

interface Props {
    checks: Check[];
}

function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function LatencyChart({ checks }: Props) {
    const data = [...checks]
        .reverse()
        .slice(-20)
        .map((c) => ({
            time: formatTime(c.checkedAt),
            ms: c.responseTime,
            isUp: c.isUp,
        }));

    const avg = data.length > 0
        ? Math.round(data.reduce((s, d) => s + d.ms, 0) / data.length)
        : null;

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Response Time</p>
                {avg !== null && (
                    <span className="text-sm font-semibold text-white/70">avg {avg}ms</span>
                )}
            </div>

            {data.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-xs text-white/30">No data yet</div>
            ) : (
                <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis
                            dataKey="time"
                            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `${v}ms`}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(15,15,40,0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 12,
                                fontSize: 12,
                                color: '#fff',
                            }}
                            formatter={(v) => [`${v}ms`, 'Response Time']}
                            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                        />
                        <Bar dataKey="ms" radius={[4, 4, 0, 0]}>
                            {data.map((entry, i) => (
                                <Cell
                                    key={i}
                                    fill={entry.isUp ? '#7c3aed' : '#ef4444'}
                                    fillOpacity={0.8}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
