'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthContext } from '@/contexts/AuthContext';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

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
}

interface EndpointFormProps {
    endpoint?: Endpoint | null;
    onClose: () => void;
    onSaved: (isEdit: boolean, name: string) => void;
}

function FloatInput({
    id, label, type = 'text', value, onChange,
}: {
    id: string; label: string; type?: string; value: string; onChange: (v: string) => void;
}) {
    return (
        <div className="relative">
            <input
                id={id}
                type={type}
                value={value}
                placeholder=" "
                onChange={(e) => onChange(e.target.value)}
                className="peer w-full rounded-2xl border border-white/10 bg-white/10 px-4 pb-3 pt-6 text-sm text-white placeholder-transparent backdrop-blur-md outline-none transition-all duration-300 focus:border-fuchsia-300/40 focus:bg-white/12 focus:shadow-[0_0_0_4px_rgba(217,70,239,0.10)]"
            />
            <label
                htmlFor={id}
                className="pointer-events-none absolute left-4 top-2 text-xs text-white/70 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-white/45 peer-focus:top-2 peer-focus:text-xs peer-focus:text-fuchsia-200"
            >
                {label}
            </label>
        </div>
    );
}

export default function EndpointForm({ endpoint, onClose, onSaved }: EndpointFormProps) {
    const { user } = useAuthContext();
    const isEdit = !!endpoint;

    const [name, setName] = useState(endpoint?.name ?? '');
    const [url, setUrl] = useState(endpoint?.url ?? '');
    const [method, setMethod] = useState(endpoint?.method ?? 'GET');
    const [description, setDescription] = useState(endpoint?.description ?? '');
    const [headers, setHeaders] = useState(
        endpoint?.headers ? JSON.stringify(endpoint.headers) : ''
    );
    const [body, setBody] = useState(endpoint?.body ?? '');
    const [interval, setInterval] = useState(String(endpoint?.interval ?? 60000));
    const [timeout, setTimeout] = useState(String(endpoint?.timeout ?? 10000));
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const payload = {
            name,
            url,
            method,
            description: description || undefined,
            headers: headers || undefined,
            body: body || undefined,
            interval: Number(interval),
            timeout: Number(timeout),
            ...(!isEdit && { userId: user!.id }),
        };

        try {
            if (isEdit) {
                await api.patch(`/endpoints/${endpoint.id}`, payload);
            } else {
                await api.post('/endpoints', payload);
            }
            onSaved(isEdit, name);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Failed to save endpoint.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,#0c1445_0%,#1f1d67_45%,#34104f_100%)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-8 top-6 h-32 w-32 rounded-full bg-fuchsia-400/15 blur-3xl" />
                    <div className="absolute right-8 bottom-6 h-24 w-24 rounded-full bg-violet-400/15 blur-3xl" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold tracking-widest text-white uppercase">
                            {isEdit ? 'Edit Endpoint' : 'Add Endpoint'}
                        </h2>
                        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors cursor-pointer">
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {error && (
                            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {error}
                            </div>
                        )}

                        <FloatInput id="name" label="Name" value={name} onChange={setName} />
                        <FloatInput id="url" label="URL" value={url} onChange={setUrl} />

                        <div className="relative">
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 pb-3 pt-6 text-sm text-white backdrop-blur-md outline-none transition-all duration-300 focus:border-fuchsia-300/40 appearance-none cursor-pointer"
                            >
                                {METHODS.map((m) => (
                                    <option key={m} value={m} className="bg-[#1f1d67]">{m}</option>
                                ))}
                            </select>
                            <label className="pointer-events-none absolute left-4 top-2 text-xs text-white/70">
                                Method
                            </label>
                        </div>

                        <FloatInput id="description" label="Description (optional)" value={description} onChange={setDescription} />
                        <FloatInput id="headers" label='Headers JSON (optional, e.g. {"Authorization":"Bearer token"})' value={headers} onChange={setHeaders} />
                        <FloatInput id="body" label="Body (optional)" value={body} onChange={setBody} />

                        <div className="grid grid-cols-2 gap-3">
                            <FloatInput id="interval" label="Interval (ms)" type="number" value={interval} onChange={setInterval} />
                            <FloatInput id="timeout" label="Timeout (ms)" type="number" value={timeout} onChange={setTimeout} />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full rounded-2xl border border-white/15 px-4 py-3 text-sm font-medium tracking-widest text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white cursor-pointer"
                            >
                                CANCEL
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-2xl px-4 py-3 text-sm font-medium tracking-widest text-white transition-all duration-300 bg-[linear-gradient(90deg,#c026d3_0%,#7c3aed_55%,#9333ea_100%)] shadow-[0_0_28px_rgba(192,38,211,0.45)] hover:shadow-[0_0_40px_rgba(217,70,239,0.6)] hover:scale-[1.01] disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {loading ? 'SAVING...' : 'SAVE'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
