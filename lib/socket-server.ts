// Helper to emit Socket.io events from API routes
export const emitToUser = (userId: string, event: string, data: any) => {
    if (global.io) {
        global.io.to(`user:${userId}`).emit(event, data);
    }
};

export const emitToMultipleUsers = (userIds: string[], event: string, data: any) => {
    if (global.io) {
        userIds.forEach((userId) => {
            global.io.to(`user:${userId}`).emit(event, data);
        });
    }
};
