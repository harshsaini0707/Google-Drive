'use client';

import FileCard from './FileCard';

interface FileListProps {
    files: any[];
    onFileDeleted?: () => void;
    section?: string;
}

export default function FileList({ files, onFileDeleted, section = 'my-files' }: FileListProps) {
    if (files.length === 0) {
        return (
            <div className="text-center py-12">
                <svg
                    className="mx-auto h-12 w-12 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-400">No files</h3>
                <p className="mt-1 text-sm text-gray-500">
                    {section === 'trash' ? 'Trash is empty' : 'Get started by uploading a file.'}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
                <FileCard key={file.id} file={file} onDelete={onFileDeleted} section={section} />
            ))}
        </div>
    );
}
