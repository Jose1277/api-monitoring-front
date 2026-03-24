'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Radio, LogOut, Menu, X } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/endpoints', label: 'Endpoints', icon: Radio },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthContext();
    const [endpointCount, setEndpointCount] = useState<number | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        api.get<{ id: string }[]>('/endpoints')
            .then(({ data }) => setEndpointCount(data.length))
            .catch(() => setEndpointCount(null));
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Title */}
            <div className="px-4 py-5 border-b border-white/10 flex items-center justify-between">
                <span className="text-sm font-semibold tracking-widest text-white/90 uppercase">
                    API Monitoring
                </span>
                <button
                    className="md:hidden flex h-9 w-9 items-center justify-center hover:cursor-pointer rounded-lg border border-white/10 bg-white/10 text-white"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-1 p-4 flex-1">
                {links.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || pathname.startsWith(href + '/');
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium tracking-wide transition-all duration-200 ${active
                                ? 'bg-white/15 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
                                : 'text-white/50 hover:bg-white/8 hover:text-white/80'
                                }`}
                        >
                            <Icon size={16} className={active ? 'text-fuchsia-300' : 'text-white/40'} />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom: endpoint count + user + logout */}
            <div className="border-t border-white/10 p-4 flex flex-col gap-3">
                <span className="text-xs tracking-wide text-white/40">
                    {endpointCount === null
                        ? 'Monitoring 0 APIs'
                        : `Monitoring ${endpointCount} ${endpointCount === 1 ? 'API' : 'APIs'}`}
                </span>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-xs font-semibold text-white uppercase">
                            {user?.name?.[0]}
                        </div>
                        <span className="text-sm text-white/70">{user?.name}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="cursor-pointer text-white/40 transition-colors hover:text-white/80"
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile toggle button — only shows when sidebar is closed */}
            {!open && (
                <button
                    className="md:hidden fixed top-4 left-4 z-50 flex h-9 w-9 items-center hover:cursor-pointer justify-center rounded-lg border border-white/10 bg-white/10 text-white backdrop-blur-md"
                    onClick={() => setOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu size={16} />
                </button>
            )}

            {/* Mobile overlay */}
            {open && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:static inset-y-0 left-0 z-40
                    w-56 shrink-0 border-r border-white/10 bg-[#0c1445]/95 md:bg-white/5 backdrop-blur-md
                    flex flex-col
                    transition-transform duration-300 md:translate-x-0
                    ${open ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
