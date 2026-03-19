'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomePage() {
    const { token, loading } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !token) {
            router.replace('/login');
        }
    }, [token, loading, router]);

    if (loading || !token) return null;

    return (
        <>
            <main className='min-h-screen flex flex-col'>
                <Header />

                <Footer />
            </main>
        </>
    );
}
