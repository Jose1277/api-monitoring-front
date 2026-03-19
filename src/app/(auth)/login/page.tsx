'use client';

import { useState, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import RedirectingMessage from '@/components/RedirectingMessage';
import Footer from '@/components/Footer';

interface FloatInputProps {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    rightElement?: ReactNode;
}

function FloatInput({
    id,
    label,
    type = 'text',
    value,
    onChange,
    rightElement,
}: FloatInputProps) {
    return (
        <div className="relative">
            <input
                id={id}
                name={id}
                type={type}
                value={value}
                placeholder=" "
                onChange={(e) => onChange(e.target.value)}
                className="peer w-full rounded-2xl border border-white/10 bg-white/10 px-4 pb-3 pt-6 pr-12 text-sm text-white placeholder-transparent backdrop-blur-md outline-none transition-all duration-300 focus:border-fuchsia-300/40 focus:bg-white/12 focus:shadow-[0_0_0_4px_rgba(217,70,239,0.10)]"
            />

            <label
                htmlFor={id}
                className="pointer-events-none absolute left-4 top-2 text-xs text-white/70 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-white/45 peer-focus:top-2 peer-focus:text-xs peer-focus:text-fuchsia-200"
            >
                {label}
            </label>

            {rightElement && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/65">
                    {rightElement}
                </div>
            )}
        </div>
    );
}

export default function LoginPage() {
    const { login, loading } = useAuthContext();
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setError('');

        try {
            await login(email, password);
            setSuccess(true);
            setTimeout(() => router.push('/dashboard'), 2000);
        } catch (err: unknown) {
            const axiosMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(axiosMessage ?? 'Login failed. Please try again.');
        }
    };

    const eyeButton = (
        <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="cursor-pointer text-white/60 transition hover:text-white"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
    );

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
                            LOGIN
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {success && <RedirectingMessage label="Login successful! Redirecting" />}

                        {error && (
                            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {error}
                            </div>
                        )}

                        <FloatInput
                            id="email"
                            label="Email"
                            type="email"
                            value={email}
                            onChange={setEmail}
                        />

                        <FloatInput
                            id="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={setPassword}
                            rightElement={eyeButton}
                        />

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="mt-4 w-full rounded-2xl px-4 py-3 font-medium tracking-[0.08em] text-white transition-all duration-300 bg-[linear-gradient(90deg,#c026d3_0%,#7c3aed_55%,#9333ea_100%)] shadow-[0_0_28px_rgba(192,38,211,0.45)] hover:shadow-[0_0_40px_rgba(217,70,239,0.6)] hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100 hover:cursor-pointer"
                        >
                            {loading ? 'LOGGING IN...' : 'LOGIN'}
                        </button>
                    </form>
                </div>
            </section>
            <Footer />
        </main>
    );
}
