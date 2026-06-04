// src/app/(main)/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, getDocs, startAfter, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PostCard from '@/components/feed/PostCard';
import { Article } from '@/types';
import { Loader2, ChevronDown, Flame, Clock } from 'lucide-react';

type FeedTab = 'latest' | 'trending';

// ✅ Saari categories list (Aapki types file se)
const CATEGORIES = ['All', 'National', 'International', 'Gujarat', 'Economy', 'Science & Technology', 'Sports', 'Environment', 'Education', 'Health'];

export default function HomeFeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>('latest');
  const [activeCategory, setActiveCategory] = useState<string>('All'); // ✅ Naya State
  const [articles, setArticles] = useState<Article[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchArticles = useCallback(async (tab: FeedTab, category: string, isLoadMore = false) => {
    if (!isLoadMore) {
      setLoading(true);
      setArticles([]);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const articlesRef = collection(db, 'articles');
      let constraints: any[] = [];

      // 1. Category Filter Check
      if (category !== 'All') {
        constraints.push(where('category', '==', category));
      }

      // 2. Tab Order Check
      if (tab === 'latest') {
        constraints.push(orderBy('createdAt', 'desc'));
      } else {
        constraints.push(orderBy('likesCount', 'desc'));
      }

      // 3. Load More Check
      if (isLoadMore && lastVisible) {
        constraints.push(startAfter(lastVisible));
      }
      
      constraints.push(limit(10));

      // Query lagao
      const q = query(articlesRef, ...constraints);
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setHasMore(false);
      } else {
        const fetchedArticles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Article[];
        
        if (isLoadMore) {
          setArticles(prev => [...prev, ...fetchedArticles]);
        } else {
          setArticles(fetchedArticles);
        }
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        if (snapshot.docs.length < 10) setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      // 🚨 IMPORTANT FOR FIREBASE INDEXES: See note below
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastVisible]); // Added dependency

  useEffect(() => {
    setLastVisible(null); // Reset cursor on tab/category change
    fetchArticles(activeTab, activeCategory, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeCategory]); 

  return (
    <div className="max-w-2xl mx-auto w-full py-6 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Explore</h1>
        
        <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl w-full sm:w-fit border border-gray-200 dark:border-gray-800 mb-6">
          <button onClick={() => setActiveTab('latest')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'latest' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Clock className="w-4 h-4" /> Latest
          </button>
          <button onClick={() => setActiveTab('trending')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'trending' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Flame className={`w-4 h-4 ${activeTab === 'trending' ? 'text-orange-500' : ''}`} /> Trending
          </button>
        </div>

        {/* ✅ CATEGORY BUTTONS (Horizontal Scroll) */}
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                activeCategory === cat 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white dark:bg-gray-950 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl">
          <p className="text-gray-500">Is category mein abhi koi news nahi mili.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {articles.map((article) => <PostCard key={article.id} article={article} />)}
          {hasMore && (
            <div className="flex justify-center pt-6 pb-12">
              <button onClick={() => fetchArticles(activeTab, activeCategory, true)} disabled={loadingMore} className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-full font-medium shadow-sm disabled:opacity-50">
                {loadingMore ? <><Loader2 className="w-5 h-5 animate-spin" /> Loading...</> : <>Load More <ChevronDown className="w-5 h-5" /></>}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}