// src/app/(main)/connections/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import Link from 'next/link';
import { Users, UserPlus, UserCheck, Loader2 } from 'lucide-react';

// Using dummy data for initial UI rendering, replace with actual Firebase fetch similar to saved page
const DUMMY_REQUESTS = [
  { id: '1', name: 'Rahul Desai', role: 'Data Scientist', avatar: '/default-avatar.png' },
  { id: '2', name: 'Neha Sharma', role: 'Policy Analyst', avatar: '/default-avatar.png' }
];

export default function ConnectionsPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'network' | 'requests'>('requests');

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Login Required</h2>
        <p className="text-gray-500">Sign in to manage your professional network.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full py-6 px-4 sm:px-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" /> My Network
          </h1>
          <p className="text-gray-500 mt-1">Manage your connections and pending requests.</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-1 inline-flex border border-gray-200 dark:border-gray-800">
          <button 
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'requests' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Pending ({DUMMY_REQUESTS.length})
          </button>
          <button 
            onClick={() => setActiveTab('network')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'network' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Connections
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        
        {activeTab === 'requests' && (
          <div>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/50">
              <h2 className="font-semibold text-gray-900 dark:text-white">Connection Requests</h2>
            </div>
            {DUMMY_REQUESTS.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No pending requests.</div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-900">
                {DUMMY_REQUESTS.map((req) => (
                  <li key={req.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition">
                    <div className="flex items-center gap-4">
                      <Image src={req.avatar} alt={req.name} width={56} height={56} className="rounded-full border border-gray-200 dark:border-gray-800" />
                      <div>
                        <Link href={`/profile/${req.id}`} className="font-bold text-lg text-gray-900 dark:text-white hover:underline">{req.name}</Link>
                        <p className="text-gray-500 text-sm">{req.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">Ignore</button>
                      <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition flex items-center gap-2">
                        <UserCheck className="w-4 h-4" /> Accept
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'network' && (
          <div className="p-12 text-center">
            <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">You haven't added any connections yet.</p>
            <Link href="/search" className="text-blue-600 font-medium hover:underline">Find people to connect with</Link>
          </div>
        )}
        
      </div>
    </div>
  );
}