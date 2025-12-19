'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatFileSize, formatDate } from '@/lib/format';
import RenameModal from './RenameModal';
import ShareModal from './ShareModal';
import FileViewer from './FileViewer';

interface FileCardProps {
    file: any;
    onDelete?: () => void;
}

export default function FileCard({ file, onDelete }: FileCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showFileViewer, setShowFileViewer] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this file?')) return;

        setDeleting(true);
        try {
            const response = await fetch(`/api/files/${file.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete file');
            }

            onDelete?.();
            router.refresh();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete file');
        } finally {
            setDeleting(false);
        }
    };

    const handleFileClick = () => {
        setShowFileViewer(true);
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) {
            return (
                <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
            );
        }
        if (mimeType.includes('pdf')) {
            return (
                <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
            );
        }
        return (
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
        );
    };

    const isOwner = !file.permission || file.permission === 'owner';

    return (
        <>
            <div
                className="group relative bg-gray-800 hover:bg-gray-750 rounded-lg p-4 transition-colors border border-gray-700 hover:border-gray-600 cursor-pointer"
                onClick={handleFileClick}
            >
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">{getFileIcon(file.mimeType)}</div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-200 truncate">{file.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span>{formatDate(new Date(file.createdAt))}</span>
                        </div>
                        {file.permission && file.permission !== 'owner' && (
                            <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded">
                                {file.permission}
                            </span>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                            className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                                {isOwner && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setShowRenameModal(true);
                                                setShowMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-t-lg"
                                        >
                                            Rename
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowShareModal(true);
                                                setShowMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                        >
                                            Share
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-lg disabled:opacity-50"
                                >
                                    {deleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showRenameModal && (
                <RenameModal
                    fileId={file.id}
                    currentName={file.name}
                    onClose={() => setShowRenameModal(false)}
                />
            )}

            {showShareModal && (
                <ShareModal
                    fileId={file.id}
                    fileName={file.name}
                    onClose={() => setShowShareModal(false)}
                />
            )}

            {showFileViewer && (
                <FileViewer
                    fileId={file.id}
                    fileName={file.name}
                    mimeType={file.mimeType}
                    onClose={() => setShowFileViewer(false)}
                />
            )}
        </>
    );
}
