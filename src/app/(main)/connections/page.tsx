// src/app/(main)/connections/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import Link from 'next/link';
import { Users, UserPlus, UserCheck, Loader2, Search, Briefcase, X } from 'lucide-react';

const DUMMY_REQUESTS = [
  { id: '1', name: 'Rahul Desai', role: 'Senior Data Scientist @ TechCorp', avatar: 'https://ui-avatars.com/api/?name=Rahul+Desai&background=0D8ABC&color=fff' },
  { id: '2', name: 'Neha Sharma', role: 'Policy Analyst & Writer', avatar: 'https://ui-avatars.com/api/?name=Neha+Sharma&background=f43f5e&color=fff' }
];

const SUGGESTED_CONNECTIONS = [
  { id: '3', name: 'Amit Patel', role: 'Economics Reporter', mutual: 12, avatar: 'https://ui-avatars.com/api/?name=Amit+Patel&background=8b5cf6&color=fff' },
  { id: '4', name: 'Priya Singh', role: 'Tech Enthusiast', mutual: 5, avatar: 'https://ui-avatars.com/api/?name=Priya+Singh&background=10b981&color=fff' },
  { id: '5', name: 'Vikram Joshi', role: 'Government Affairs Analyst', mutual: 8, avatar: 'https://ui-avatars.com/api/?name=Vikram+Joshi&background=f59e0b&color=fff' }
];

export default function ConnectionsPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'network' | 'discover'>('requests');

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Loading your professional network...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center bg-white dark:bg-gray-950 mt-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <Users className="w-16 h-16 text-blue-600 mx-auto mb-6" />
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Join the Professional Network</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">Sign in to connect with journalists, analysts, and other news enthusiasts.</p>
        <Link href="/login" className="bg-blue-600 text-white px-8 py-3.5 rounded-full font-bold shadow-md hover:bg-blue-700 transition">
          Log In or Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full py-8 px-4 sm:px-6">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" /> My Network
          </h1>
          <p className="text-gray-500 font-medium mt-2">Manage your professional connections and expand your reach.</p>
        </div>
        
        {/* Search Connections */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search connections..." 
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-1 mb-8 overflow-x-auto scrollbar-hide shadow-sm">
        <button 
          onClick={() => setActiveTab('requests')}
          className={`flex-1 min-w-[120px] px-6 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'requests' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          Requests <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{DUMMY_REQUESTS.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('network')}
          className={`flex-1 min-w-[120px] px-6 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'network' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          My Connections
        </button>
        <button 
          onClick={() => setActiveTab('discover')}
          className={`flex-1 min-w-[120px] px-6 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'discover' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          Discover
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        
        {/* REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div>
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/20">
              <h2 className="font-extrabold text-gray-900 dark:text-white">Pending Invitations</h2>
            </div>
            {DUMMY_REQUESTS.length === 0 ? (
              <div className="p-16 text-center">
                <UserCheck className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">You have no pending connection requests.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-900">
                {DUMMY_REQUESTS.map((req) => (
                  <li key={req.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                    <div className="flex items-center gap-5">
                      <Image src={req.avatar} alt={req.name} width={64} height={64} className="rounded-full border-2 border-gray-100 dark:border-gray-800" />
                      <div>
                        <Link href={`/profile/${req.id}`} className="font-bold text-lg text-gray-900 dark:text-white hover:text-blue-600 transition-colors">{req.name}</Link>
                        <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {req.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition border border-transparent hover:border-gray-200 dark:hover:border-gray-700 flex items-center justify-center gap-2">
                        <X className="w-4 h-4" /> Ignore
                      </button>
                      <button className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition shadow-sm flex items-center justify-center gap-2">
                        <UserCheck className="w-4 h-4" /> Accept
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* NETWORK TAB */}
        {activeTab === 'network' && (
          <div className="p-16 text-center">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100 dark:border-gray-800">
              <UserPlus className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Grow your network</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">You haven't added any connections yet. Start building your professional circle.</p>
            <button onClick={() => setActiveTab('discover')} className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold shadow-md hover:opacity-90 transition">
              Discover People
            </button>
          </div>
        )}

        {/* DISCOVER TAB */}
        {activeTab === 'discover' && (
          <div>
             <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/20">
              <h2 className="font-extrabold text-gray-900 dark:text-white">People you may know</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {SUGGESTED_CONNECTIONS.map((person) => (
                <div key={person.id} className="border border-gray-200 dark:border-gray-800 rounded-2xl p-5 text-center hover:shadow-md transition-shadow">
                  <Image src={person.avatar} alt={person.name} width={80} height={80} className="rounded-full mx-auto mb-4 border-2 border-gray-100 dark:border-gray-800" />
                  <Link href={`/profile/${person.id}`} className="font-bold text-gray-900 dark:text-white hover:text-blue-600 block truncate">{person.name}</Link>
                  <p className="text-xs text-gray-500 mt-1 mb-3 truncate">{person.role}</p>
                  <p className="text-[11px] font-medium text-gray-400 mb-5">{person.mutual} mutual connections</p>
                  <button className="w-full flex items-center justify-center gap-2 py-2 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 rounded-full text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                    <UserPlus className="w-4 h-4" /> Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}