'use client';

import { useEffect, useState, Suspense, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Sidebar, { MobileMenuButton } from '@/components/Sidebar';
import FileUpload from '@/components/FileUpload';
import FileList from '@/components/FileList';
import SearchBar from '@/components/SearchBar';
import { initSocket, disconnectSocket, onFileShared, onFileDeleted, onFileRenamed, onShareRevoked, offFileShared, offFileDeleted, offFileRenamed, offShareRevoked } from '@/lib/socket';

function DashboardContent() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Prevent duplicate API calls
    const isFetching = useRef(false);
    const lastFetchKey = useRef('');
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const query = searchParams.get('q') || '';
    const activeSection = searchParams.get('section') || 'my-files';

    // Optimized fetchFiles with duplicate call prevention - DEFINED FIRST
    const fetchFiles = useCallback(async (force = false) => {
        // Create a unique key for this fetch request
        const fetchKey = `${activeSection}-${query}`;

        // Prevent duplicate calls for same data
        if (!force && (isFetching.current || fetchKey === lastFetchKey.current)) {
            return;
        }

        isFetching.current = true;
        lastFetchKey.current = fetchKey;
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
                        const myFiles = data.filter((f: any) => !f.permission || f.permission === 'owner');
                        setFiles(myFiles);
                    } else if (activeSection === 'shared-with-me') {
                        const sharedFiles = data.filter((f: any) => f.permission && f.permission !== 'owner');
                        setFiles(sharedFiles);
                    } else {
                        setFiles(data);
                    }
                } else {
                    setFiles(data);
                }
            } else {
                setFiles([]);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
            setFiles([]);
        } finally {
            isFetching.current = false;
            setLoading(false);
        }
    }, [activeSection, query]);

    // Initialize Socket.io ONCE - only when user logs in
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            initSocket(session.user.id);

            // Debounce socket events to prevent rapid API calls
            let refreshTimeout: NodeJS.Timeout | null = null;
            const debouncedRefresh = () => {
                if (refreshTimeout) clearTimeout(refreshTimeout);
                refreshTimeout = setTimeout(() => {
                    fetchFiles(true);  // Force refresh
                }, 300);  // Wait 300ms before refreshing
            };

            onFileShared(debouncedRefresh);
            onFileDeleted(debouncedRefresh);
            onFileRenamed(debouncedRefresh);
            onShareRevoked(debouncedRefresh);

            return () => {
                if (refreshTimeout) clearTimeout(refreshTimeout);
                offFileShared(debouncedRefresh);
                offFileDeleted(debouncedRefresh);
                offFileRenamed(debouncedRefresh);
                offShareRevoked(debouncedRefresh);
            };
        }
    }, [session?.user?.id, fetchFiles]);

    // Fetch files when section or query changes
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }

        if (status === 'authenticated') {
            fetchFiles();
        }
    }, [activeSection, query, status, fetchFiles]);


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
        <div className="flex h-screen bg-gray-950 overflow-hidden">
            {/* Sidebar */}
            <Sidebar isMobileOpen={isMobileMenuOpen} onMobileClose={() => setIsMobileMenuOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-gray-900 border-b border-gray-800 px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between gap-3">
                        {/* Mobile menu button */}
                        <MobileMenuButton onClick={() => setIsMobileMenuOpen(true)} />

                        <div className="flex-1 max-w-2xl">
                            <SearchBar />
                        </div>
                        <div className="hidden sm:flex items-center gap-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <img
                                    src={session?.user?.image || '/default-avatar.png'}
                                    alt={session?.user?.name || 'User'}
                                    className="w-8 h-8 rounded-full"
                                />
                                <span className="hidden md:block text-gray-200 text-sm">{session?.user?.name}</span>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/', redirect: true })}
                                className="hidden sm:block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>

                        {/* Mobile user menu */}
                        <div className="sm:hidden flex items-center">
                            <img
                                src={session?.user?.image || '/default-avatar.png'}
                                alt={session?.user?.name || 'User'}
                                className="w-8 h-8 rounded-full"
                            />
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto px-4 sm:px-6 py-4 sm:py-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Section Header */}
                        <div className="mb-4 sm:mb-6">
                            <h1 className="text-xl sm:text-2xl font-semibold text-gray-100">{getSectionTitle()}</h1>
                        </div>

                        {/* Upload Section (only for My Files) */}
                        {activeSection === 'my-files' && (
                            <div className="mb-6 sm:mb-8">
                                <h2 className="text-base sm:text-lg font-medium text-gray-200 mb-3 sm:mb-4">Upload Files</h2>
                                <FileUpload onUploadComplete={() => fetchFiles(true)} />
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
                                onFileDeleted={() => fetchFiles(true)}
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
