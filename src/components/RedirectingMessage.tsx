'use client';

import { useEffect, useState } from 'react';

const DOTS = ['.', '..', '...'];

export default function RedirectingMessage({ label }: { label: string }) {
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setFrame((f) => (f + 1) % DOTS.length), 500);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {label}{DOTS[frame]}
        </div>
    );
}
