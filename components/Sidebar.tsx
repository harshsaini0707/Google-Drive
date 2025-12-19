'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { FolderOpen, Users, Send, Trash2 } from 'lucide-react';

export default function Sidebar() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeSection = searchParams.get('section') || 'my-files';

    const navItems = [
        { id: 'my-files', label: 'My Files', icon: FolderOpen },
        { id: 'shared-with-me', label: 'Shared with me', icon: Users },
        { id: 'i-shared', label: 'Files I shared', icon: Send },
        { id: 'trash', label: 'Trash', icon: Trash2 },
    ];

    const handleNavigation = (sectionId: string) => {
        router.push(`/dashboard?section=${sectionId}`);
    };

    return (
        <div className="w-64 bg-gray-900 h-screen flex flex-col border-r border-gray-800">
            {/* Logo */}
            <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl font-bold">D</span>
                </div>
                <span className="text-white text-xl font-semibold">Drive</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavigation(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-left ${activeSection === item.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
