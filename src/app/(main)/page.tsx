// src/app/(main)/page.tsx 
// (Agar aapki home feed kisi aur file mein hai toh usme ye code daalna)

'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, startAfter, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PostCard from '@/components/feed/PostCard';
import { Article } from '@/types';
import { Loader2, ChevronDown } from 'lucide-react';

export default function HomeFeedPage() {
  // 1. Zaroori States (Memory)
  const [articles, setArticles] = useState<Article[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 2. Pehli 10 posts laane ka function (Page khulte hi chalega)
  const fetchInitialArticles = async () => {
    setLoading(true);
    try {
      // Sirf latest 10 posts laani hain
      const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'), limit(10));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      // Posts ko array mein daalo
      const fetchedArticles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Article[];

      setArticles(fetchedArticles);
      
      // Aakhri post ko 'Bookmark' bana lo agli baar ke liye
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);

      // Agar pehli baar mein hi 10 se kam post aayi hain, toh aage aur kuch nahi hai
      if (snapshot.docs.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching initial articles:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Load More dabane par agli 10 posts laane ka function
  const fetchMoreArticles = async () => {
    if (!lastVisible || !hasMore) return;

    setLoadingMore(true);
    try {
      // Bookmark (startAfter) se aage ki 10 posts laani hain
      const q = query(
        collection(db, 'articles'), 
        orderBy('createdAt', 'desc'), 
        startAfter(lastVisible), 
        limit(10)
      );
      
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setHasMore(false);
        setLoadingMore(false);
        return;
      }

      const newArticles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Article[];

      // Purani posts ke sath nayi posts ko jod (merge) do
      setArticles(prev => [...prev, ...newArticles]);
      
      // Naya Bookmark set karo
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);

      // Agar nayi posts 10 se kam hain, toh Load More button chhupa do
      if (snapshot.docs.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more articles:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Jaise hi page load ho, pehli 10 posts le aao
  useEffect(() => {
    fetchInitialArticles();
  }, []);

  return (
    <div className="max-w-2xl mx-auto w-full py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Updates</h1>
        <p className="text-gray-500 text-sm">Stay informed with the newest articles</p>
      </div>

      {/* Main Feed */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl">
          <p className="text-gray-500">Koi news nahi mili. AI ko thoda time do post karne ke liye!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Saari loaded posts yahan dikhengi */}
          {articles.map((article) => (
            <PostCard key={article.id} article={article} />
          ))}

          {/* Load More Button */}
          {hasMore ? (
            <div className="flex justify-center pt-6 pb-12">
              <button 
                onClick={fetchMoreArticles}
                disabled={loadingMore}
                className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-full font-medium hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More <ChevronDown className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center pt-6 pb-12">
              <p className="text-gray-400 dark:text-gray-600 text-sm font-medium">
                Aapne saari news padh li hai! 🎉
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}