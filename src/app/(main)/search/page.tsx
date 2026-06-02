// src/app/(main)/search/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { InstantSearch, SearchBox, Hits, Configure } from 'react-instantsearch';
import { searchClient, INDICES } from '@/lib/algolia';
import Link from 'next/link';
import Image from 'next/image';
import { Search, FileText, Users, Hash } from 'lucide-react';

// Custom Hit Component for Articles
const ArticleHit = ({ hit }: { hit: any }) => (
  <Link href={`/article/${hit.slug}`} className="block bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 rounded-xl hover:shadow-md transition mb-4">
    <div className="flex gap-4">
      {hit.coverImage && (
        <div className="w-24 h-24 relative rounded-lg overflow-hidden flex-shrink-0 hidden sm:block">
          <Image src={hit.coverImage} alt={hit.title} fill className="object-cover" />
        </div>
      )}
      <div className="flex-1">
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md mb-2 inline-block">
          {hit.category}
        </span>
        <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1">
          {hit.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2">{hit.summary}</p>
        <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
          <span>By {hit.authorName}</span>
          {hit.aiScores?.trustScore && (
            <span className="text-green-600 font-medium border border-green-200 bg-green-50 px-1.5 rounded">
              AI Trust: {hit.aiScores.trustScore}%
            </span>
          )}
        </div>
      </div>
    </div>
  </Link>
);

// Inner component using useSearchParams
function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [activeTab, setActiveTab] = useState<'articles' | 'users' | 'channels'>('articles');

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Search className="w-8 h-8 text-blue-600" />
          Explore & Search
        </h1>
        <p className="text-gray-500 mt-2">Find news, professional connections, and channels.</p>
      </div>

      <InstantSearch searchClient={searchClient} indexName={
        activeTab === 'articles' ? INDICES.ARTICLES : 
        activeTab === 'users' ? INDICES.USERS : INDICES.CHANNELS
      }>
        <Configure hitsPerPage={10} query={initialQuery} />

        {/* Custom Search Input */}
        <div className="mb-8">
          <SearchBox 
            classNames={{
              root: 'relative w-full',
              form: 'relative',
              input: 'w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl px-5 py-4 pl-12 text-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white shadow-sm',
              submitIcon: 'absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400',
              resetIcon: 'hidden'
            }}
            placeholder="Search for current affairs, authors, or topics..."
          />
        </div>

        {/* Search Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('articles')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition whitespace-nowrap ${activeTab === 'articles' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <FileText className="w-4 h-4" /> Articles
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition whitespace-nowrap ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <Users className="w-4 h-4" /> People
          </button>
          <button 
            onClick={() => setActiveTab('channels')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition whitespace-nowrap ${activeTab === 'channels' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <Hash className="w-4 h-4" /> Channels
          </button>
        </div>

        {/* Search Results Area */}
        <div className="min-h-[400px]">
          {activeTab === 'articles' && (
            <Hits hitComponent={ArticleHit} classNames={{ list: 'space-y-4' }} />
          )}

          {activeTab === 'users' && (
            <div className="text-center text-gray-500 py-10">
              User search results will appear here.
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="text-center text-gray-500 py-10">
              Channel search results will appear here.
            </div>
          )}
        </div>

      </InstantSearch>
    </>
  );
}

// Main page component wrapped in Suspense boundary
export default function SearchPage() {
  return (
    <div className="max-w-4xl mx-auto w-full py-8 px-4 sm:px-6">
      <Suspense fallback={<div className="text-center text-gray-500 py-10">Loading search...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}