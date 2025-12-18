import { z } from 'zod';

export const fileUploadSchema = z.object({
    name: z.string().min(1, 'File name is required').max(255, 'File name too long'),
    size: z.number().max(100 * 1024 * 1024, 'File size must be less than 100MB'),
    type: z.string().min(1, 'File type is required'),
});

export const fileRenameSchema = z.object({
    name: z.string().min(1, 'File name is required').max(255, 'File name too long'),
});

export const shareFileSchema = z.object({
    email: z.string().email('Invalid email address'),
    permission: z.enum(['read', 'edit', 'delete'], {
        errorMap: () => ({ message: 'Permission must be read, edit, or delete' }),
    }),
});

export const updatePermissionSchema = z.object({
    permission: z.enum(['read', 'edit', 'delete'], {
        errorMap: () => ({ message: 'Permission must be read, edit, or delete' }),
    }),
});

export const searchQuerySchema = z.object({
    q: z.string().min(1, 'Search query is required'),
});

