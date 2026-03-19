'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Radio } from 'lucide-react';

const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/endpoints', label: 'Endpoints', icon: Radio },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-56 shrink-0 border-r border-white/10 bg-white/5 backdrop-blur-md flex flex-col gap-1 p-4">
            {links.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/');
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium tracking-wide transition-all duration-200 ${
                            active
                                ? 'bg-white/15 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
                                : 'text-white/50 hover:bg-white/8 hover:text-white/80'
                        }`}
                    >
                        <Icon size={16} className={active ? 'text-fuchsia-300' : 'text-white/40'} />
                        {label}
                    </Link>
                );
            })}
        </aside>
    );
}
