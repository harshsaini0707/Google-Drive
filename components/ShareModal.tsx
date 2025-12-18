'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ShareModalProps {
    fileId: string;
    fileName: string;
    onClose: () => void;
}

export default function ShareModal({ fileId, fileName, onClose }: ShareModalProps) {
    const [email, setEmail] = useState('');
    const [permissions, setPermissions] = useState({
        read: true,
        edit: false,
        delete: false,
    });
    const [loading, setLoading] = useState(false);
    const [shares, setShares] = useState<any[]>([]);
    const [loadingShares, setLoadingShares] = useState(true);
    const router = useRouter();

    const fetchShares = async () => {
        try {
            const response = await fetch(`/api/files/${fileId}/share`);
            if (response.ok) {
                const data = await response.json();
                setShares(data);
            }
        } catch (error) {
            console.error('Error fetching shares:', error);
        } finally {
            setLoadingShares(false);
        }
    };

    useEffect(() => {
        fetchShares();
    }, [fileId]);

    const handleShare = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        // Determine highest permission level
        let permission: 'read' | 'edit' | 'delete' = 'read';
        if (permissions.delete) permission = 'delete';
        else if (permissions.edit) permission = 'edit';

        setLoading(true);
        try {
            const response = await fetch(`/api/files/${fileId}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), permission }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to share file');
            }

            setEmail('');
            setPermissions({ read: true, edit: false, delete: false });
            fetchShares();
            router.refresh();
        } catch (error) {
            console.error('Share error:', error);
            alert(error instanceof Error ? error.message : 'Failed to share file');
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (shareId: string) => {
        try {
            const response = await fetch(`/api/files/${fileId}/share/${shareId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to revoke access');
            }

            fetchShares();
            router.refresh();
        } catch (error) {
            console.error('Revoke error:', error);
            alert('Failed to revoke access');
        }
    };

    const handlePermissionChange = (perm: 'read' | 'edit' | 'delete') => {
        setPermissions({
            ...permissions,
            [perm]: !permissions[perm],
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg border border-gray-700" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-semibold text-gray-100 mb-2">Share "{fileName}"</h2>
                <p className="text-sm text-gray-400 mb-6">Share this file with others</p>

                <form onSubmit={handleShare} className="mb-6">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                    />

                    <div className="mb-3">
                        <p className="text-sm text-gray-400 mb-2">Permissions:</p>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={permissions.read}
                                    onChange={() => handlePermissionChange('read')}
                                    className="w-4 h-4 rounded bg-gray-900 border-gray-700"
                                />
                                <span className="text-sm text-gray-300">Read - Can view the file</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={permissions.edit}
                                    onChange={() => handlePermissionChange('edit')}
                                    className="w-4 h-4 rounded bg-gray-900 border-gray-700"
                                />
                                <span className="text-sm text-gray-300">Edit - Can rename the file</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={permissions.delete}
                                    onChange={() => handlePermissionChange('delete')}
                                    className="w-4 h-4 rounded bg-gray-900 border-gray-700"
                                />
                                <span className="text-sm text-gray-300">Delete - Can delete the file</span>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !email.trim()}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Sharing...' : 'Share'}
                    </button>
                </form>

                <div className="border-t border-gray-700 pt-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-3">People with access</h3>

                    {loadingShares ? (
                        <p className="text-sm text-gray-500">Loading...</p>
                    ) : shares.length === 0 ? (
                        <p className="text-sm text-gray-500">No one has access yet</p>
                    ) : (
                        <div className="space-y-2">
                            {shares.map((share) => (
                                <div key={share.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 text-sm font-medium">
                                            {share.sharedWith.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-200">{share.sharedWith.name}</p>
                                            <p className="text-xs text-gray-500">{share.sharedWith.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded">
                                            {share.permission}
                                        </span>
                                        <button
                                            onClick={() => handleRevoke(share.id)}
                                            className="text-xs text-red-400 hover:text-red-300"
                                        >
                                            Revoke
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
