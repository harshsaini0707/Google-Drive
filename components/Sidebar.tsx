'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function Sidebar() {
    const searchParams = useSearchParams();
    const activeSection = searchParams.get('section') || 'my-files';

    const navItems = [
        { id: 'home', label: 'Home', icon: '🏠' },
        { id: 'my-files', label: 'My Files', icon: '📁' },
        { id: 'shared-with-me', label: 'Shared with me', icon: '👥' },
        { id: 'i-shared', label: 'Files I shared', icon: '📤' },
        { id: 'trash', label: 'Trash', icon: '🗑️' },
    ];

    return (
        <div className="w-64 bg-gray-900 h-screen flex flex-col border-r border-gray-800">
            {/* Logo */}
            <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl font-bold">D</span>
                </div>
                <span className="text-white text-xl font-semibold">Drive</span>
            </div>

            {/* New Button */}
            <div className="px-4 py-2">
                <Link
                    href="/dashboard?section=my-files"
                    className="flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors"
                >
                    <span className="text-2xl">+</span>
                    <span className="text-gray-200 font-medium">New</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.id}
                        href={`/dashboard?section=${item.id}`}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeSection === item.id
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-800'
                            }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
