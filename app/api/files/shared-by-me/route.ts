import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { files, fileShares } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET - Fetch files I shared with others
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get files owned by me that are shared
        const myFiles = await db.query.files.findMany({
            where: eq(files.ownerId, session.user.id),
            with: {
                shares: {
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
                },
            },
        });

        // Filter only files that have shares
        const sharedFiles = myFiles.filter(file => file.shares && file.shares.length > 0);

        return NextResponse.json(sharedFiles);
    } catch (error) {
        console.error('Error fetching shared files:', error);
        return NextResponse.json(
            { error: 'Failed to fetch shared files' },
            { status: 500 }
        );
    }
}
