import { db } from '@/db';
import { files, fileShares } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';

export async function canRead(userId: string, fileId: string): Promise<boolean> {
    const file = await db.query.files.findFirst({
        where: eq(files.id, fileId),
        with: {
            shares: {
                where: eq(fileShares.sharedWithUserId, userId),
            },
        },
    });

    if (!file) return false;
    if (file.ownerId === userId) return true;
    if (file.shares.length > 0) return true;

    return false;
}

export async function canEdit(userId: string, fileId: string): Promise<boolean> {
    const file = await db.query.files.findFirst({
        where: eq(files.id, fileId),
        with: {
            shares: {
                where: and(
                    eq(fileShares.sharedWithUserId, userId),
                    or(eq(fileShares.permission, 'edit'), eq(fileShares.permission, 'delete'))
                ),
            },
        },
    });

    if (!file) return false;
    if (file.ownerId === userId) return true;
    if (file.shares.length > 0) return true;

    return false;
}

export async function canDelete(userId: string, fileId: string): Promise<boolean> {
    const file = await db.query.files.findFirst({
        where: eq(files.id, fileId),
        with: {
            shares: {
                where: and(
                    eq(fileShares.sharedWithUserId, userId),
                    eq(fileShares.permission, 'delete')
                ),
            },
        },
    });

    if (!file) return false;
    if (file.ownerId === userId) return true;
    if (file.shares.length > 0) return true;

    return false;
}

export async function isOwner(userId: string, fileId: string): Promise<boolean> {
    const file = await db.query.files.findFirst({
        where: eq(files.id, fileId),
    });

    if (!file) return false;
    return file.ownerId === userId;
}

