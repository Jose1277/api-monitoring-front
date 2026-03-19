'use client';

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine,
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

export default function UptimeChart({ checks }: Props) {
    const data = [...checks]
        .reverse()
        .slice(-50)
        .map((c) => ({
            time: formatTime(c.checkedAt),
            status: c.isUp ? 1 : 0,
        }));

    const uptimePct = checks.length > 0
        ? Math.round((checks.filter((c) => c.isUp).length / checks.length) * 1000) / 10
        : null;

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Uptime</p>
                {uptimePct !== null && (
                    <span className={`text-sm font-semibold ${uptimePct >= 99 ? 'text-green-400' : uptimePct >= 90 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {uptimePct}%
                    </span>
                )}
            </div>

            {data.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-xs text-white/30">No data yet</div>
            ) : (
                <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                            dataKey="time"
                            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            domain={[-0.1, 1.1]}
                            ticks={[0, 1]}
                            tickFormatter={(v) => v === 1 ? 'Up' : 'Down'}
                            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(15,15,40,0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 12,
                                fontSize: 12,
                                color: '#fff',
                            }}
                            formatter={(v) => [Number(v) === 1 ? 'Up' : 'Down', 'Status']}
                        />
                        <ReferenceLine y={0.5} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                        <Line
                            type="stepAfter"
                            dataKey="status"
                            stroke="#a855f7"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: '#a855f7' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
