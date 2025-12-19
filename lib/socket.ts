import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (userId: string) => {
    if (socket?.connected) {
        return socket;
    }

    // Connect to Socket.io server
    socket = io('http://localhost:3000', {
        transports: ['websocket', 'polling'],
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
