import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { files, fileShares } from '@/db/schema';
import { deleteFileFromS3 } from '@/lib/s3';
import { canDelete, canEdit, isOwner } from '@/lib/permissions';
import { fileRenameSchema } from '@/lib/validators';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ fileId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fileId } = await params;

        const hasPermission = await canDelete(session.user.id, fileId);
        if (!hasPermission) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Check if user is the owner
        const userIsOwner = await isOwner(session.user.id, fileId);

        if (userIsOwner) {
            // Owner: Soft delete the file
            await db
                .update(files)
                .set({ deleted: true, updatedAt: new Date() })
                .where(eq(files.id, fileId));
            return NextResponse.json({ message: 'File moved to trash' });
        } else {
            // Non-owner: Remove their share access
            await db
                .delete(fileShares)
                .where(
                    and(
                        eq(fileShares.fileId, fileId),
                        eq(fileShares.sharedWithUserId, session.user.id)
                    )
                );
            return NextResponse.json({ message: 'File removed from your view' });
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json(
            { error: 'Failed to delete file' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ fileId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fileId } = await params;

        const hasPermission = await canEdit(session.user.id, fileId);
        if (!hasPermission) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const validation = fileRenameSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const [updatedFile] = await db
            .update(files)
            .set({
                name: validation.data.name,
                updatedAt: new Date(),
            })
            .where(eq(files.id, fileId))
            .returning();

        if (!updatedFile) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        return NextResponse.json(updatedFile);
    } catch (error) {
        console.error('Error renaming file:', error);
        return NextResponse.json(
            { error: 'Failed to rename file' },
            { status: 500 }
        );
    }
}
