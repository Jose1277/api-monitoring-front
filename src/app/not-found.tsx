import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#0c1445_0%,#1f1d67_45%,#34104f_100%)] px-4">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] bg-fuchsia-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 text-center space-y-4">
                <p className="text-6xl font-bold text-white/10">404</p>
                <h1 className="text-2xl font-semibold tracking-widest text-white">
                    PAGE NOT FOUND
                </h1>
                <p className="text-sm text-white/50">
                    This page doesn't exist.
                </p>
                <Link
                    href="/login"
                    className="inline-block mt-4 rounded-2xl px-6 py-2.5 text-sm font-medium tracking-[0.08em] text-white bg-white/10 border border-white/10 hover:bg-white/15 transition-all duration-300"
                >
                    GO TO LOGIN
                </Link>
            </div>
        </main>
    );
}
