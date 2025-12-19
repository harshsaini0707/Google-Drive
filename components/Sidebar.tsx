'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FolderOpen, Users, Send, Trash2, Menu, X, LogOut } from 'lucide-react';
import { Suspense, useState } from 'react';
import { signOut } from 'next-auth/react';

interface SidebarContentProps {
    isMobileOpen?: boolean;
    onClose?: () => void;
}

function SidebarContent({ isMobileOpen = false, onClose }: SidebarContentProps) {
    const searchParams = useSearchParams();
    const activeSection = searchParams.get('section') || 'my-files';

    const navItems = [
        { id: 'my-files', label: 'My Files', icon: FolderOpen },
        { id: 'shared-with-me', label: 'Shared with me', icon: Users },
        { id: 'i-shared', label: 'Files I shared', icon: Send },
        { id: 'trash', label: 'Trash', icon: Trash2 },
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-64 bg-gray-900 h-screen flex flex-col border-r border-gray-800 flex-shrink-0
                transform transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl font-bold">D</span>
                        </div>
                        <span className="text-white text-xl font-semibold">Drive</span>
                    </div>

                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;
                        const params = new URLSearchParams(searchParams.toString());
                        params.set('section', item.id);

                        return (
                            <Link
                                key={item.id}
                                href={`/dashboard?${params.toString()}`}
                                onClick={onClose}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-left ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Sign Out Button (Mobile Only) */}
                <div className="lg:hidden px-2 pb-4">
                    <button
                        onClick={() => {
                            signOut({ callbackUrl: '/', redirect: true });
                            onClose?.();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-left text-red-400 hover:bg-gray-800"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </div>
        </>
    );
}

interface SidebarProps {
    isMobileOpen: boolean;
    onMobileClose: () => void;
}

export default function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
    return (
        <Suspense fallback={
            <div className="w-64 bg-gray-900 h-screen flex flex-col border-r border-gray-800 flex-shrink-0 hidden lg:flex">
                <div className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl font-bold">D</span>
                    </div>
                    <span className="text-white text-xl font-semibold">Drive</span>
                </div>
            </div>
        }>
            <SidebarContent isMobileOpen={isMobileOpen} onClose={onMobileClose} />
        </Suspense>
    );
}

// Export hamburger button component
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Open menu"
        >
            <Menu className="w-6 h-6 text-gray-300" />
        </button>
    );
}
