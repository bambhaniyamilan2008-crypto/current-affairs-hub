// src/components/shared/Navbar.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser } from '@/services/auth.service';
import { Search, Bell } from 'lucide-react';
import Image from 'next/image';

export default function Navbar() {
  const { user, loading } = useAuth();

  return (
    <header className="h-16 sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <span className="text-xl font-bold hidden sm:block text-gray-900 dark:text-white">
            Current Affairs
          </span>
        </Link>

        {/* Global Search */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search news, users, or channels..." 
              className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {!loading && (
            user ? (
              <div className="flex items-center gap-3">
                <Link href="/profile/me">
                  <Image 
                    src={user.photoURL || '/default-avatar.png'} 
                    alt="Profile" 
                    width={32} 
                    height={32} 
                    className="rounded-full border border-gray-200 dark:border-gray-800"
                  />
                </Link>
                <button onClick={logoutUser} className="text-sm font-medium text-gray-500 hover:text-red-500 hidden sm:block">
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Sign In
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}