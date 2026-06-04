// src/components/shared/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
// ✅ Zaroori icons import kar liye
import { Home, Flame, Grid, Tv, Bookmark, User, LogIn, Search, PlusCircle, Users } from 'lucide-react';
import Image from 'next/image';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const safeUserName = user ? ((user as any).fullName || user.displayName || 'User') : 'User';
  const safeUserAvatar = user ? ((user as any).profilePic || user.photoURL || '/default-avatar.png') : '/default-avatar.png';
  const profilePath = user ? `/profile/${user.uid}` : '/login';

  // 🔥 YAHAN HAIN AAPKE ASLI FOLDERS KE RASTE (PATHS)
  const menuItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Search', path: '/search', icon: Search },          // Aapka Search folder
    { name: 'Categories', path: '/category', icon: Grid },      // category folder
    { name: 'Trending', path: '/trending', icon: Flame },       // Naya banayenge (agar chahiye toh)
    { name: 'Channels', path: '/channel', icon: Tv },           // channel folder
    { name: 'Saved', path: '/save', icon: Bookmark },           // save folder
    { name: 'Connections', path: '/connection', icon: Users },  // connection folder
    { name: 'Create', path: '/create', icon: PlusCircle },      // create folder (News daalne ke liye)
    { name: 'Profile', path: profilePath, icon: User },         // profile folder
  ];

  return (
    <aside className="hidden lg:block w-72 h-[calc(100vh-4rem)] sticky top-16 p-4 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0 overflow-y-auto scrollbar-hide">
      <div className="space-y-1 mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Path matching ka logic thoda smart kiya hai
          const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
              <span className="text-[15px]">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Login/Profile Status Widget */}
      <div className="mt-8 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        {user ? (
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer hover:opacity-80 transition" onClick={() => router.push(profilePath)}>
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
              <Image src={safeUserAvatar} alt="Avatar" fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-gray-900 dark:text-white">{safeUserName}</p>
              <p className="text-xs text-green-500 truncate font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span> Online
              </p>
            </div>
          </div>
        ) : (
          <button onClick={() => router.push('/login')} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition">
            <LogIn className="w-4 h-4" /> Log In
          </button>
        )}
      </div>
    </aside>
  );
}