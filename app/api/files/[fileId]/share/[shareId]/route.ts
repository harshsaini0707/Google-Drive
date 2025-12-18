import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { fileShares } from '@/db/schema';
import { isOwner } from '@/lib/permissions';
import { updatePermissionSchema } from '@/lib/validators';
import { eq } from 'drizzle-orm';

export async function PATCH(
    request: Request,
    { params }: { params: { fileId: string; shareId: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fileId, shareId } = params;

        const userIsOwner = await isOwner(session.user.id, fileId);
        if (!userIsOwner) {
            return NextResponse.json(
                { error: 'Only file owner can update permissions' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validation = updatePermissionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const [updated] = await db
            .update(fileShares)
            .set({
                permission: validation.data.permission,
                updatedAt: new Date(),
            })
            .where(eq(fileShares.id, shareId))
            .returning();

        if (!updated) {
            return NextResponse.json({ error: 'Share not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating permission:', error);
        return NextResponse.json(
            { error: 'Failed to update permission' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { fileId: string; shareId: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fileId, shareId } = params;

        const userIsOwner = await isOwner(session.user.id, fileId);
        if (!userIsOwner) {
            return NextResponse.json(
                { error: 'Only file owner can revoke access' },
                { status: 403 }
            );
        }

        await db.delete(fileShares).where(eq(fileShares.id, shareId));

        return NextResponse.json({ message: 'Access revoked successfully' });
    } catch (error) {
        console.error('Error revoking access:', error);
        return NextResponse.json(
            { error: 'Failed to revoke access' },
            { status: 500 }
        );
    }
}
