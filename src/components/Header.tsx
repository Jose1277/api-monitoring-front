'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export default function Header() {
    const router = useRouter();
    const { user, logout } = useAuthContext();
    const [endpointCount, setEndpointCount] = useState<number | null>(null);

    useEffect(() => {
        api.get<{ id: string }[]>('/endpoints')
            .then(({ data }) => setEndpointCount(data.length))
            .catch(() => setEndpointCount(null));
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <header className="relative flex w-full items-center justify-between border-b border-white/10 bg-white/5 px-6 py-3 backdrop-blur-md">
            {/* Left */}
            <span className="text-sm font-semibold tracking-widest text-white/90 uppercase">
                API Monitoring
            </span>

            {/* Center */}
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2">
                <span className="text-xs tracking-wide text-white/50 whitespace-nowrap">
                    {endpointCount === null
                        ? 'Monitoring 0 APIs'
                        : `Monitoring ${endpointCount} ${endpointCount === 1 ? 'API' : 'APIs'}`}
                </span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-xs font-semibold text-white uppercase">
                        {user?.name?.[0]}
                    </div>
                    <span className="text-sm text-white/70">{user?.name}</span>
                </div>

                <button
                    onClick={handleLogout}
                    className="cursor-pointer text-xs tracking-widest text-white/40 uppercase transition-colors duration-200 hover:text-white/80"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}