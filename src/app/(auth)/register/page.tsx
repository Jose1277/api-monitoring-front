'use client';

import { useState, type ReactNode, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

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

export default function RegisterPage() {
    const { register, loading } = useAuthContext();

    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const getRules = (pwd: string) => ({
        length: pwd.length >= 8,
        uppercase: /[A-Z]/.test(pwd),
        lowercase: /[a-z]/.test(pwd),
        number: /[0-9]/.test(pwd),
        specialChar: /[@$!%*?&#]/.test(pwd),
    });

    const rules = getRules(password);
    const strengthScore = Object.values(rules).filter(Boolean).length;
    const isPasswordValid = Object.values(rules).every(Boolean);
    const passwordsMatch = confirmPassword.length > 0 && confirmPassword === password;
    const showStrength = password.length >= 3;
    const showConfirmCheck = confirmPassword.length > 0;

    const strength =
        strengthScore <= 2
            ? {
                label: 'Weak',
                barClass: 'w-1/3 bg-red-400',
                textClass: 'text-red-300',
            }
            : strengthScore <= 4
                ? {
                    label: 'Medium',
                    barClass: 'w-2/3 bg-amber-400',
                    textClass: 'text-amber-300',
                }
                : {
                    label: 'Strong',
                    barClass: 'w-full bg-emerald-400',
                    textClass: 'text-emerald-300',
                };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (!isPasswordValid) return;
        if (password !== confirmPassword) return;

        try {
            await register(name, email, password);
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Registration failed. Please try again.';
            setError(message);
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
                {/* inner glows */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-10 top-8 h-40 w-40 rounded-full bg-fuchsia-400/15 blur-3xl" />
                    <div className="absolute right-10 top-16 h-28 w-28 rounded-full bg-pink-300/20 blur-3xl" />
                    <div className="absolute bottom-6 right-4 h-36 w-36 rounded-full bg-violet-400/15 blur-3xl" />
                </div>

                <div className="relative z-10">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-semibold tracking-[0.18em] text-white md:text-4xl">
                            REGISTER
                        </h1>
                        <p className="mt-2 text-sm text-white/60">
                            Create your account and get started.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {error}
                            </div>
                        )}

                        <FloatInput
                            id="name"
                            label="Name"
                            value={name}
                            onChange={setName}
                        />

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

                        {showStrength && (
                            <div className="-mt-1 space-y-2 px-1">
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                                    <div
                                        className={`h-full rounded-full transition-all duration-300 ${strength.barClass}`}
                                    />
                                </div>
                                <p className={`text-xs font-medium ${strength.textClass}`}>
                                    {strength.label}
                                </p>
                            </div>
                        )}

                        <FloatInput
                            id="confirmPassword"
                            label="Confirm Password"
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            rightElement={eyeButton}
                        />

                        {showConfirmCheck && (
                            <p
                                className={`-mt-1 px-1 text-xs font-medium ${passwordsMatch ? 'text-emerald-300' : 'text-red-300'
                                    }`}
                            >
                                {passwordsMatch
                                    ? '✓ Passwords match'
                                    : '✗ Passwords do not match'}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !isPasswordValid || !passwordsMatch}
                            className="mt-4 w-full rounded-2xl px-4 py-3 font-medium tracking-[0.08em] text-white transition-all duration-300 bg-[linear-gradient(90deg,#c026d3_0%,#7c3aed_55%,#9333ea_100%)] shadow-[0_0_28px_rgba(192,38,211,0.45)] hover:shadow-[0_0_40px_rgba(217,70,239,0.6)] hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100"
                        >
                            {loading ? 'REGISTERING...' : 'REGISTER'}
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
}