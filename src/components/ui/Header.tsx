import React from 'react';
import Link from 'next/link';
import { UserCircle } from 'lucide-react'; 

export const Header = () => {
    return (
        <header className="w-full">
            <div className="w-full bg-white rounded-2xl shadow-sm px-6 py-4 flex justify-between items-center">
                <h1 className="text-lg font-semibold text-gray-600">
                    Irrigation Management
                </h1>

                <nav className="flex items-center gap-6">
                    <Link href="/dashboard" className="text-gray-600 font-medium hover:text-blue-600 transition">
                        Dashboard
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2 text-gray-600 font-medium hover:text-blue-600 transition">
                        <UserCircle size={20} />
                        <span>Profile</span>
                    </Link>
                </nav>
            </div>
        </header>
    );
};