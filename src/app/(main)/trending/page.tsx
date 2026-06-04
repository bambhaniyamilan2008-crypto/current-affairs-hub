// src/app/(main)/trending/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PostCard from '@/components/feed/PostCard';
import { Article } from '@/types';
import { Loader2, Flame } from 'lucide-react';

export default function TrendingPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // 🔥 Real-world logic: Sabse zyada likes wali top 20 news
        const q = query(collection(db, 'articles'), orderBy('likesCount', 'desc'), limit(20));
        const snapshot = await getDocs(q);
        
        const fetchedArticles = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Article[];
        
        setArticles(fetchedArticles);
      } catch (error) {
        console.error("Error fetching trending:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return (
    <div className="max-w-2xl mx-auto w-full py-6 px-4 sm:px-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-6 mb-8 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mb-3">
          <Flame className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Trending Right Now</h1>
        <p className="text-gray-500 text-sm max-w-sm">The most viral and highly engaged news across the platform.</p>
      </div>

      {/* Main Feed */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800">
          Abhi tak koi news trending nahi hui hai.
        </div>
      ) : (
        <div className="space-y-6">
          {articles.map((article) => (
            <PostCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}