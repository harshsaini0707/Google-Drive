'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RenameModalProps {
    fileId: string;
    currentName: string;
    onClose: () => void;
}

export default function RenameModal({ fileId, currentName, onClose }: RenameModalProps) {
    const [name, setName] = useState(currentName);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRename = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/files/${fileId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() }),
            });

            if (!response.ok) {
                throw new Error('Failed to rename file');
            }

            router.refresh();
            onClose();
        } catch (error) {
            console.error('Rename error:', error);
            alert('Failed to rename file');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-semibold text-gray-100 mb-4">Rename File</h2>

                <form onSubmit={handleRename}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter new name"
                        autoFocus
                    />

                    <div className="flex gap-3 mt-6 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Renaming...' : 'Rename'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
