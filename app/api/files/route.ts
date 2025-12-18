import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { files, fileShares, users } from '@/db/schema';
import { uploadFileToS3 } from '@/lib/s3';
import { fileUploadSchema } from '@/lib/validators';
import { eq, or, and, ilike } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const validation = fileUploadSchema.safeParse({
            name: file.name,
            size: file.size,
            type: file.type,
        });

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const { s3Key, s3Url } = await uploadFileToS3(
            buffer,
            file.name,
            file.type,
            session.user.id
        );

        const [newFile] = await db
            .insert(files)
            .values({
                name: file.name,
                s3Key,
                s3Url,
                mimeType: file.type,
                size: file.size,
                ownerId: session.user.id,
            })
            .returning();

        return NextResponse.json(newFile, { status: 201 });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        const ownedFiles = await db.query.files.findMany({
            where: query
                ? and(eq(files.ownerId, session.user.id), ilike(files.name, `%${query}%`))
                : eq(files.ownerId, session.user.id),
            with: {
                owner: {
                    columns: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: (files, { desc }) => [desc(files.createdAt)],
        });

        const sharedWithMe = await db.query.fileShares.findMany({
            where: eq(fileShares.sharedWithUserId, session.user.id),
            with: {
                file: {
                    where: query ? ilike(files.name, `%${query}%`) : undefined,
                    with: {
                        owner: {
                            columns: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        const userFiles = [
            ...ownedFiles.map((f) => ({ ...f, permission: 'owner' as const })),
            ...sharedWithMe.map((s) => ({
                ...s.file,
                permission: s.permission,
            })),
        ];

        return NextResponse.json(userFiles);
    } catch (error) {
        console.error('Error fetching files:', error);
        return NextResponse.json(
            { error: 'Failed to fetch files' },
            { status: 500 }
        );
    }
}
