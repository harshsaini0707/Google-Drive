import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { files } from '@/db/schema';
import { getSignedDownloadUrl } from '@/lib/s3';
import { canRead } from '@/lib/permissions';
import { eq } from 'drizzle-orm';

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

        const hasPermission = await canRead(session.user.id, fileId);
        if (!hasPermission) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const file = await db.query.files.findFirst({
            where: eq(files.id, fileId),
        });

        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const downloadUrl = await getSignedDownloadUrl(file.s3Key);

        return NextResponse.json({ url: downloadUrl });
    } catch (error) {
        console.error('Error getting download URL:', error);
        return NextResponse.json(
            { error: 'Failed to get download URL' },
            { status: 500 }
        );
    }
}
