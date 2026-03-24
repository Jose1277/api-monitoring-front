import Sidebar from '@/components/layout/Sidebar';

export default function EndpointsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex bg-[linear-gradient(135deg,#0c1445_0%,#1f1d67_45%,#34104f_100%)]">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6 pt-16 md:pt-6">
                {children}
            </main>
        </div>
    );
}
