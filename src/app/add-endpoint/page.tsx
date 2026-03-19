'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Footer from '@/components/Footer';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

interface FloatInputProps {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
}

function FloatInput({ id, label, type = 'text', value, onChange }: FloatInputProps) {
    return (
        <div className="relative">
            <input
                id={id}
                name={id}
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

export default function AddEndpointPage() {
    const { user } = useAuthContext();
    const router = useRouter();

    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [method, setMethod] = useState('GET');
    const [description, setDescription] = useState('');
    const [headers, setHeaders] = useState('');
    const [body, setBody] = useState('');
    const [interval, setInterval] = useState('60000');
    const [timeout, setTimeout] = useState('10000');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/endpoints', {
                name,
                url,
                method,
                description: description || undefined,
                headers: headers || undefined,
                body: body || undefined,
                interval: Number(interval),
                timeout: Number(timeout),
                userId: user!.id,
            });
            router.push('/dashboard');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Failed to create endpoint.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#0c1445_0%,#1f1d67_45%,#34104f_100%)] px-4 py-10">

            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] bg-fuchsia-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[120px]" />
            </div>

            <section className="relative z-10 w-full max-w-xl overflow-hidden rounded-[28px] border border-white/10 bg-white/8 px-6 py-8 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.30)] md:px-10 md:py-10">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-10 top-8 h-40 w-40 rounded-full bg-fuchsia-400/15 blur-3xl" />
                    <div className="absolute right-10 top-16 h-28 w-28 rounded-full bg-pink-300/20 blur-3xl" />
                    <div className="absolute bottom-6 right-4 h-36 w-36 rounded-full bg-violet-400/15 blur-3xl" />
                </div>

                <div className="relative z-10">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-semibold tracking-[0.18em] text-white md:text-4xl">
                            ADD ENDPOINT
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {error}
                            </div>
                        )}

                        <FloatInput id="name" label="Name" value={name} onChange={setName} />
                        <FloatInput id="url" label="URL" value={url} onChange={setUrl} />

                        {/* Method selector */}
                        <div className="relative">
                            <select
                                id="method"
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 pb-3 pt-6 text-sm text-white backdrop-blur-md outline-none transition-all duration-300 focus:border-fuchsia-300/40 focus:bg-white/12 focus:shadow-[0_0_0_4px_rgba(217,70,239,0.10)] appearance-none cursor-pointer"
                            >
                                {METHODS.map((m) => (
                                    <option key={m} value={m} className="bg-[#1f1d67] text-white">
                                        {m}
                                    </option>
                                ))}
                            </select>
                            <label className="pointer-events-none absolute left-4 top-2 text-xs text-white/70">
                                Method
                            </label>
                        </div>

                        <FloatInput id="description" label="Description (optional)" value={description} onChange={setDescription} />
                        <FloatInput id="headers" label="Headers (optional, max 500 chars)" value={headers} onChange={setHeaders} />
                        <FloatInput id="body" label="Body (optional, max 2000 chars)" value={body} onChange={setBody} />

                        <div className="grid grid-cols-2 gap-4">
                            <FloatInput id="interval" label="Interval (ms)" type="number" value={interval} onChange={setInterval} />
                            <FloatInput id="timeout" label="Timeout (ms)" type="number" value={timeout} onChange={setTimeout} />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="w-full rounded-2xl border border-white/15 px-4 py-3 text-sm font-medium tracking-[0.08em] text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white cursor-pointer"
                            >
                                CANCEL
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-2xl px-4 py-3 font-medium tracking-[0.08em] text-white transition-all duration-300 bg-[linear-gradient(90deg,#c026d3_0%,#7c3aed_55%,#9333ea_100%)] shadow-[0_0_28px_rgba(192,38,211,0.45)] hover:shadow-[0_0_40px_rgba(217,70,239,0.6)] hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100 cursor-pointer"
                            >
                                {loading ? 'SAVING...' : 'SAVE'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
            <Footer />
        </main>
    );
}
