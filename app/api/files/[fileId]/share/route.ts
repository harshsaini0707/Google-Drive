import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { fileShares, users, files } from '@/db/schema';
import { isOwner } from '@/lib/permissions';
import { shareFileSchema } from '@/lib/validators';
import { eq, and } from 'drizzle-orm';
import { emitToUser } from '@/lib/socket-server';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ fileId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fileId } = await params;

        const userIsOwner = await isOwner(session.user.id, fileId);
        if (!userIsOwner) {
            return NextResponse.json(
                { error: 'Only file owner can share files' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validation = shareFileSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const userToShareWith = await db.query.users.findFirst({
            where: eq(users.email, validation.data.email),
        });

        if (!userToShareWith) {
            return NextResponse.json(
                { error: 'User not found with this email' },
                { status: 404 }
            );
        }

        if (userToShareWith.id === session.user.id) {
            return NextResponse.json(
                { error: 'Cannot share file with yourself' },
                { status: 400 }
            );
        }

        const existingShare = await db.query.fileShares.findFirst({
            where: and(
                eq(fileShares.fileId, fileId),
                eq(fileShares.sharedWithUserId, userToShareWith.id)
            ),
        });

        // Get file details for notification
        const file = await db.query.files.findFirst({
            where: eq(files.id, fileId),
        });

        if (existingShare) {
            const [updated] = await db
                .update(fileShares)
                .set({
                    permission: validation.data.permission,
                    updatedAt: new Date(),
                })
                .where(eq(fileShares.id, existingShare.id))
                .returning();

            // Emit Socket.io event to notify user
            emitToUser(userToShareWith.id, 'file-shared', {
                fileId,
                fileName: file?.name,
                sharedBy: session.user.name,
                permission: validation.data.permission,
            });

            return NextResponse.json(updated);
        }

        const [newShare] = await db
            .insert(fileShares)
            .values({
                fileId,
                sharedWithUserId: userToShareWith.id,
                sharedByUserId: session.user.id,
                permission: validation.data.permission,
            })
            .returning();

        // Emit Socket.io event to notify user
        emitToUser(userToShareWith.id, 'file-shared', {
            fileId,
            fileName: file?.name,
            sharedBy: session.user.name,
            permission: validation.data.permission,
        });

        return NextResponse.json(newShare, { status: 201 });
    } catch (error) {
        console.error('Error sharing file:', error);
        return NextResponse.json(
            { error: 'Failed to share file' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ fileId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fileId } = await params;

        const userIsOwner = await isOwner(session.user.id, fileId);
        if (!userIsOwner) {
            return NextResponse.json(
                { error: 'Only file owner can view shares' },
                { status: 403 }
            );
        }

        const shares = await db.query.fileShares.findMany({
            where: eq(fileShares.fileId, fileId),
            with: {
                sharedWith: {
                    columns: {
                        id: true,
                        name: true,
                        email: true,
                        profilePicture: true,
                    },
                },
            },
        });

        return NextResponse.json(shares);
    } catch (error) {
        console.error('Error fetching shares:', error);
        return NextResponse.json(
            { error: 'Failed to fetch shares' },
            { status: 500 }
        );
    }
}
