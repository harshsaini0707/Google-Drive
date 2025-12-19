'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import FileUpload from '@/components/FileUpload';
import FileList from '@/components/FileList';
import SearchBar from '@/components/SearchBar';
import { initSocket, disconnectSocket, onFileShared, onFileDeleted, onFileRenamed, onShareRevoked, offFileShared, offFileDeleted, offFileRenamed, offShareRevoked } from '@/lib/socket';

function DashboardContent() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const query = searchParams.get('q') || '';
    const activeTab = searchParams.get('tab') || 'my-files';

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }

        if (status === 'authenticated' && session?.user?.id) {
            fetchFiles();

            // Initialize Socket.io connection
            const socket = initSocket(session.user.id);

            // Set up event listeners
            const handleFileShared = (data: any) => {
                console.log('File shared:', data);
                fetchFiles();
            };

            const handleFileDeleted = (data: any) => {
                console.log('File deleted:', data);
                fetchFiles();
            };

            const handleFileRenamed = (data: any) => {
                console.log('File renamed:', data);
                fetchFiles();
            };

            const handleShareRevoked = (data: any) => {
                console.log('Share revoked:', data);
                fetchFiles();
            };

            onFileShared(handleFileShared);
            onFileDeleted(handleFileDeleted);
            onFileRenamed(handleFileRenamed);
            onShareRevoked(handleShareRevoked);


            return () => {
                offFileShared(handleFileShared);
                offFileDeleted(handleFileDeleted);
                offFileRenamed(handleFileRenamed);
                offShareRevoked(handleShareRevoked);
                disconnectSocket();
            };
        }
    }, [status, session?.user?.id, query]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const url = query ? `/api/files?q=${encodeURIComponent(query)}` : '/api/files';
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                setFiles(data);
            } else {
                setFiles([]);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
            setFiles([]);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const myFiles = files.filter((f: any) => !f.permission || f.permission === 'owner');
    const sharedFiles = files.filter((f: any) => f.permission && f.permission !== 'owner');
    const displayFiles = activeTab === 'shared' ? sharedFiles : myFiles;

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                            </svg>
                            <h1 className="text-xl font-semibold text-gray-100">Google Drive Clone</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                {session.user?.image && (
                                    <img src={session.user.image} alt={session.user.name || ''} className="w-8 h-8 rounded-full" />
                                )}
                                <span className="text-sm text-gray-300">{session.user?.name}</span>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <SearchBar />
                </div>

                {activeTab === 'my-files' && (
                    <div className="mb-8">
                        <h2 className="text-lg font-medium text-gray-200 mb-4">Upload Files</h2>
                        <FileUpload onUploadComplete={fetchFiles} />
                    </div>
                )}

                <div className="flex gap-4 mb-6 border-b border-gray-700">
                    <button
                        onClick={() => router.push('/dashboard?tab=my-files')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors ${activeTab === 'my-files'
                            ? 'text-blue-500 border-b-2 border-blue-500'
                            : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        My Files ({myFiles.length})
                    </button>
                    <button
                        onClick={() => router.push('/dashboard?tab=shared')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors ${activeTab === 'shared'
                            ? 'text-blue-500 border-b-2 border-blue-500'
                            : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        Shared with Me ({sharedFiles.length})
                    </button>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-200">
                            {query ? `Search results for "${query}"` : activeTab === 'shared' ? 'Files Shared with You' : 'My Files'}
                        </h2>
                        <span className="text-sm text-gray-500">
                            {displayFiles.length} {displayFiles.length === 1 ? 'file' : 'files'}
                        </span>
                    </div>
                    <FileList files={displayFiles} onFileDeleted={fetchFiles} />
                </div>
            </main>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>}>
            <DashboardContent />
        </Suspense>
    );
}
