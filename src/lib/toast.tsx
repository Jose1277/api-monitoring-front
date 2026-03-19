'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextValue {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
};

const STYLES = {
    success: 'border-green-500/30 bg-green-500/15 text-green-300',
    error: 'border-red-500/30 bg-red-500/15 text-red-300',
    info: 'border-white/20 bg-white/10 text-white/80',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const Icon = ICONS[toast.type];

    useEffect(() => {
        const t = setTimeout(() => onRemove(toast.id), 4000);
        return () => clearTimeout(t);
    }, [toast.id, onRemove]);

    return (
        <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)] animate-in slide-in-from-right duration-300 ${STYLES[toast.type]}`}>
            <Icon size={16} className="shrink-0" />
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => onRemove(toast.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                <X size={14} />
            </button>
        </div>
    );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const add = useCallback((type: ToastType, message: string) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, type, message }]);
    }, []);

    const remove = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const value: ToastContextValue = {
        success: (msg) => add('success', msg),
        error: (msg) => add('error', msg),
        info: (msg) => add('info', msg),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-3rem)]">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onRemove={remove} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
}
