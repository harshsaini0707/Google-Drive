import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import FileUpload from '@/components/FileUpload';
import FileList from '@/components/FileList';
import SearchBar from '@/components/SearchBar';

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect('/');
    }

    const params = await searchParams;
    const query = params.q || '';
    const url = query
        ? `/api/files?q=${encodeURIComponent(query)}`
        : '/api/files';

    const response = await fetch(`http://localhost:3000${url}`, {
        headers: {
            Cookie: `authjs.session-token=${session.user.id}`,
        },
        cache: 'no-store',
    });

    const files = response.ok ? await response.json() : [];

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <svg
                                className="w-8 h-8 text-blue-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                            </svg>
                            <h1 className="text-xl font-semibold text-gray-100">
                                Google Drive Clone
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                {session.user.image && (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || ''}
                                        className="w-8 h-8 rounded-full"
                                    />
                                )}
                                <span className="text-sm text-gray-300">{session.user.name}</span>
                            </div>
                            <form
                                action={async () => {
                                    'use server';
                                    await signOut({ redirectTo: '/' });
                                }}
                            >
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Sign Out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Bar */}
                <div className="mb-6">
                    <SearchBar />
                </div>

                {/* Upload Section */}
                <div className="mb-8">
                    <h2 className="text-lg font-medium text-gray-200 mb-4">Upload Files</h2>
                    <FileUpload />
                </div>

                {/* Files Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-200">
                            {query ? `Search results for "${query}"` : 'My Files'}
                        </h2>
                        <span className="text-sm text-gray-500">
                            {files.length} {files.length === 1 ? 'file' : 'files'}
                        </span>
                    </div>
                    <FileList files={files} />
                </div>
            </main>
        </div>
    );
}