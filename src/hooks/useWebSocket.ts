import { useEffect, useRef } from 'react';
import { getSocket, disconnectSocket } from '@/lib/websocket';

export interface CheckUpdatePayload {
    endpointId: string;
    isUp: boolean;
    responseTime: number;
    checkedAt: Date;
}

export function useWebSocket(
    token: string | null,
    onCheckUpdate: (payload: CheckUpdatePayload) => void,
) {
    const callbackRef = useRef(onCheckUpdate);
    callbackRef.current = onCheckUpdate;

    useEffect(() => {
        if (!token) return;

        const socket = getSocket(token);

        const handler = (payload: CheckUpdatePayload) => {
            callbackRef.current(payload);
        };

        socket.on('check:update', handler);

        return () => {
            socket.off('check:update', handler);
            disconnectSocket();
        };
    }, [token]);
}
