'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

interface FileUploadProps {
    onUploadComplete?: () => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/files', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }

            onUploadComplete?.();
            router.refresh();
        } catch (error) {
            console.error('Upload error:', error);
            alert(error instanceof Error ? error.message : 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleUpload(files[0]);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleUpload(files[0]);
        }
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 bg-gray-800/50'
                }`}
        >
            <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
            />
            <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
            >
                <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                </svg>
                <div className="text-gray-300">
                    {uploading ? (
                        <span>Uploading...</span>
                    ) : (
                        <>
                            <span className="font-medium">Click to upload</span> or drag and drop
                        </>
                    )}
                </div>
                <p className="text-sm text-gray-500">Max file size: 100MB</p>
            </label>
        </div>
    );
}
