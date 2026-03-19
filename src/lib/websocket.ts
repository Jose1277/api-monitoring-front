import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
    if (socket?.connected) return socket;

    const url = process.env.NEXT_PUBLIC_API_URL ?? '';

    socket = io(url, {
        auth: { token },
        transports: ['websocket'],
    });

    return socket;
}

export function disconnectSocket() {
    socket?.disconnect();
    socket = null;
}
