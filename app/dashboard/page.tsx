'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
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
    const activeSection = searchParams.get('section') || 'my-files';

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
    }, [status, session?.user?.id, query, activeSection]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            let url = '';
            let needsFiltering = false;

            switch (activeSection) {
                case 'my-files':
                    url = query ? `/api/files?q=${encodeURIComponent(query)}` : '/api/files';
                    needsFiltering = true;
                    break;
                case 'shared-with-me':
                    url = '/api/files';
                    needsFiltering = true;
                    break;
                case 'i-shared':
                    url = '/api/files/shared-by-me';
                    break;
                case 'trash':
                    url = '/api/files/trash';
                    break;
                default:
                    url = '/api/files';
                    needsFiltering = true;
            }

            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();

                // Filter based on section
                if (needsFiltering) {
                    if (activeSection === 'my-files') {
                        // Only show files uploaded by user (not shared files)
                        const myFiles = data.filter((f: any) => !f.permission || f.permission === 'owner');
                        setFiles(myFiles);
                    } else if (activeSection === 'shared-with-me') {
                        // Only show files shared with user
                        const sharedFiles = data.filter((f: any) => f.permission && f.permission !== 'owner');
                        setFiles(sharedFiles);
                    } else {
                        setFiles(data);
                    }
                } else {
                    // For i-shared and trash, use data directly from API
                    setFiles(data);
                }
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

    const getSectionTitle = () => {
        switch (activeSection) {
            case 'my-files': return 'My Files';
            case 'shared-with-me': return 'Shared with me';
            case 'i-shared': return 'Files I shared';
            case 'trash': return 'Trash';
            default: return 'My Files';
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex h-screen">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center bg-gray-950">
                    <div className="text-gray-400">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-950">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 max-w-2xl">
                            <SearchBar />
                        </div>
                        <div className="flex items-center gap-4 ml-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src={session?.user?.image || '/default-avatar.png'}
                                    alt={session?.user?.name || 'User'}
                                    className="w-8 h-8 rounded-full"
                                />
                                <span className="text-gray-200 text-sm">{session?.user?.name}</span>
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto px-6 py-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Section Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-semibold text-gray-100">{getSectionTitle()}</h1>
                        </div>

                        {/* Upload Section (only for My Files) */}
                        {activeSection === 'my-files' && (
                            <div className="mb-8">
                                <h2 className="text-lg font-medium text-gray-200 mb-4">Upload Files</h2>
                                <FileUpload onUploadComplete={fetchFiles} />
                            </div>
                        )}

                        {/* Files Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-medium text-gray-200">
                                    {activeSection === 'trash' ? 'Deleted Files' : 'Files'}
                                </h2>
                                <span className="text-sm text-gray-500">
                                    {files.length} {files.length === 1 ? 'file' : 'files'}
                                </span>
                            </div>
                            <FileList
                                files={files}
                                onFileDeleted={fetchFiles}
                                section={activeSection}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
