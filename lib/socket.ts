import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (userId: string) => {
    if (socket?.connected) {
        return socket;
    }

    // Connect to Socket.io server

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ||
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,           // Auto-reconnect if disconnected
        reconnectionAttempts: 5,      // Try 5 times
        reconnectionDelay: 1000,      // Wait 1 second between attempts
    });

    socket.on('connect', () => {
        console.log('Socket connected:', socket?.id);

        socket?.emit('join-user-room', userId);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Event listeners
export const onFileShared = (callback: (data: any) => void) => {
    socket?.on('file-shared', callback);
};

export const onFileDeleted = (callback: (data: any) => void) => {
    socket?.on('file-deleted', callback);
};

export const onFileRenamed = (callback: (data: any) => void) => {
    socket?.on('file-renamed', callback);
};

export const onShareRevoked = (callback: (data: any) => void) => {
    socket?.on('share-revoked', callback);
};

// Remove listeners
export const offFileShared = (callback: (data: any) => void) => {
    socket?.off('file-shared', callback);
};

export const offFileDeleted = (callback: (data: any) => void) => {
    socket?.off('file-deleted', callback);
};

export const offFileRenamed = (callback: (data: any) => void) => {
    socket?.off('file-renamed', callback);
};

export const offShareRevoked = (callback: (data: any) => void) => {
    socket?.off('share-revoked', callback);
};
