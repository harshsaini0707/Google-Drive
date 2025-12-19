'use client';

import { useEffect, useState } from 'react';

interface FileViewerProps {
    fileId: string;
    fileName: string;
    mimeType: string;
    onClose: () => void;
}

export default function FileViewer({ fileId, fileName, mimeType, onClose }: FileViewerProps) {
    const [fileUrl, setFileUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFileUrl = async () => {
            try {
                const response = await fetch(`/api/files/${fileId}/download`);
                if (response.ok) {
                    const { url } = await response.json();
                    setFileUrl(url);
                }
            } catch (error) {
                console.error('Error fetching file:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFileUrl();
    }, [fileId]);

    const renderFileContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-96">
                    <div className="text-gray-400">Loading...</div>
                </div>
            );
        }

        if (!fileUrl) {
            return (
                <div className="flex items-center justify-center h-96">
                    <div className="text-gray-400">Failed to load file</div>
                </div>
            );
        }

        // Images
        if (mimeType.startsWith('image/')) {
            return (
                <div className="flex items-center justify-center bg-gray-900 rounded-lg p-4">
                    <img src={fileUrl} alt={fileName} className="max-w-full max-h-[70vh] object-contain" />
                </div>
            );
        }

        // PDFs
        if (mimeType === 'application/pdf') {
            return (
                <iframe
                    src={fileUrl}
                    className="w-full h-[70vh] rounded-lg"
                    title={fileName}
                />
            );
        }

        // Office files - Word, PowerPoint, Excel
        if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // .docx
            mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || // .pptx
            mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // .xlsx
            mimeType === 'application/msword' || // .doc
            mimeType === 'application/vnd.ms-powerpoint' || // .ppt
            mimeType === 'application/vnd.ms-excel' // .xls
        ) {
            return (
                <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                    className="w-full h-[70vh] rounded-lg"
                    title={fileName}
                />
            );
        }

        // Videos
        if (mimeType.startsWith('video/')) {
            return (
                <video controls className="w-full max-h-[70vh] rounded-lg">
                    <source src={fileUrl} type={mimeType} />
                    Your browser does not support the video tag.
                </video>
            );
        }

        // Audio
        if (mimeType.startsWith('audio/')) {
            return (
                <div className="flex items-center justify-center h-96">
                    <audio controls className="w-full max-w-md">
                        <source src={fileUrl} type={mimeType} />
                        Your browser does not support the audio tag.
                    </audio>
                </div>
            );
        }

        // Text files
        if (mimeType.startsWith('text/')) {
            return (
                <iframe
                    src={fileUrl}
                    className="w-full h-[70vh] rounded-lg bg-white"
                    title={fileName}
                />
            );
        }

        // Other files - show download option
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <p className="text-gray-400">Preview not available for this file type</p>
                <a
                    href={fileUrl}
                    download={fileName}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Download File
                </a>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-lg font-medium text-gray-200 truncate">{fileName}</h2>
                    <div className="flex items-center gap-2">
                        <a
                            href={fileUrl}
                            download={fileName}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Download"
                        >
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {renderFileContent()}
                </div>
            </div>
        </div>
    );
}
