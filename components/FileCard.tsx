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
    section?: string;
}

export default function FileCard({ file, onDelete, section = 'my-files' }: FileCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showFileViewer, setShowFileViewer] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        const message = section === 'trash'
            ? 'Are you sure you want to permanently delete this file?'
            : 'Are you sure you want to move this file to trash?';

        if (!confirm(message)) return;

        setDeleting(true);
        try {
            const url = section === 'trash' ? '/api/files/trash' : `/api/files/${file.id}`;
            const method = 'DELETE';
            const body = section === 'trash' ? JSON.stringify({ fileId: file.id }) : undefined;

            const response = await fetch(url, {
                method,
                headers: section === 'trash' ? { 'Content-Type': 'application/json' } : undefined,
                body,
            });

            if (!response.ok) {
                throw new Error('Failed to delete file');
            }

            onDelete?.();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete file');
        } finally {
            setDeleting(false);
        }
    };

    const handleRestore = async () => {
        setRestoring(true);
        try {
            const response = await fetch('/api/files/trash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileId: file.id }),
            });

            if (!response.ok) {
                throw new Error('Failed to restore file');
            }

            onDelete?.(); // Refresh the list
        } catch (error) {
            console.error('Restore error:', error);
            alert('Failed to restore file');
        } finally {
            setRestoring(false);
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
                            <div className="flex items-center gap-1 mt-2">
                                {file.permission === 'delete' && (
                                    <>
                                        <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 bg-green-600/20 text-green-400 rounded" title="Can view">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                        <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 bg-blue-600/20 text-blue-400 rounded" title="Can rename">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </span>
                                        <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 bg-red-600/20 text-red-400 rounded" title="Can delete">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    </>
                                )}
                                {file.permission === 'edit' && (
                                    <>
                                        <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 bg-green-600/20 text-green-400 rounded" title="Can view">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                        <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 bg-blue-600/20 text-blue-400 rounded" title="Can rename">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </span>
                                    </>
                                )}
                                {file.permission === 'read' && (
                                    <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 bg-green-600/20 text-green-400 rounded" title="Can view">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                            className="p-1 hover:bg-gray-700 rounded transition-opacity"
                        >
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                                {section === 'trash' ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRestore();
                                            setShowMenu(false);
                                        }}
                                        disabled={restoring}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg disabled:opacity-50"
                                    >
                                        {restoring ? 'Restoring...' : 'Restore'}
                                    </button>
                                ) : (
                                    <>
                                        {isOwner && (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowRenameModal(true);
                                                        setShowMenu(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-t-lg"
                                                >
                                                    Rename
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
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
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete();
                                            }}
                                            disabled={deleting}
                                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-lg disabled:opacity-50"
                                        >
                                            {deleting ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </>
                                )}
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
                    onSuccess={onDelete}
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
