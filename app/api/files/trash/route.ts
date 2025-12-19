import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { files, fileShares } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { deleteFileFromS3 } from '@/lib/s3';

// GET - Fetch deleted files (trash)
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const trashedFiles = await db.query.files.findMany({
            where: and(
                eq(files.ownerId, session.user.id),
                eq(files.deleted, true)
            ),
            orderBy: (files, { desc }) => [desc(files.updatedAt)],
        });

        return NextResponse.json(trashedFiles);
    } catch (error) {
        console.error('Error fetching trash:', error);
        return NextResponse.json(
            { error: 'Failed to fetch trash' },
            { status: 500 }
        );
    }
}

// POST - Restore file from trash
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fileId } = await request.json();

        // Check ownership
        const file = await db.query.files.findFirst({
            where: eq(files.id, fileId),
        });

        if (!file || file.ownerId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Restore file
        await db
            .update(files)
            .set({ deleted: false, updatedAt: new Date() })
            .where(eq(files.id, fileId));

        return NextResponse.json({ message: 'File restored successfully' });
    } catch (error) {
        console.error('Error restoring file:', error);
        return NextResponse.json(
            { error: 'Failed to restore file' },
            { status: 500 }
        );
    }
}

// DELETE - Permanently delete file
export async function DELETE(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fileId } = await request.json();

        // Check ownership
        const file = await db.query.files.findFirst({
            where: eq(files.id, fileId),
        });

        if (!file || file.ownerId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Delete from S3
        await deleteFileFromS3(file.s3Key);

        // Delete shares
        await db.delete(fileShares).where(eq(fileShares.fileId, fileId));

        // Delete from database
        await db.delete(files).where(eq(files.id, fileId));

        return NextResponse.json({ message: 'File permanently deleted' });
    } catch (error) {
        console.error('Error permanently deleting file:', error);
        return NextResponse.json(
            { error: 'Failed to delete file permanently' },
            { status: 500 }
        );
    }
}
