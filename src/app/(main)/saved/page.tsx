// src/app/(main)/saved/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, query, getDocs, documentId, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Article } from '@/types';
import PostCard from '@/components/feed/PostCard';
import { Bookmark, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SavedPage() {
  const { user, loading: authLoading } = useAuth();
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchSavedArticles();
    else if (!authLoading) setLoading(false);
  }, [user, authLoading]);

  const fetchSavedArticles = async () => {
    try {
      // 1. Fetch user's saved article IDs from a 'saves' subcollection
      const savesRef = collection(db, 'users', user!.uid, 'saves');
      const savesSnap = await getDocs(savesRef);
      
      if (savesSnap.empty) {
        setSavedArticles([]);
        setLoading(false);
        return;
      }

      const savedIds = savesSnap.docs.map(doc => doc.id);

      // 2. Fetch actual articles using 'in' query (batching in chunks of 10 if needed)
      // Note: Firestore 'in' query supports max 10 items. For production, chunk this array.
      const chunks = [];
      for (let i = 0; i < savedIds.length; i += 10) {
        chunks.push(savedIds.slice(i, i + 10));
      }

      let allArticles: Article[] = [];
      const articlesRef = collection(db, 'articles');

      for (const chunk of chunks) {
        const q = query(articlesRef, where(documentId(), 'in', chunk));
        const chunkSnap = await getDocs(q);
        const articles = chunkSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Article[];
        allArticles = [...allArticles, ...articles];
      }

      setSavedArticles(allArticles);
    } catch (error) {
      console.error("Error fetching saved articles:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Login Required</h2>
        <p className="text-gray-500 mb-6">Sign in to view your saved articles.</p>
        <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">Log In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full py-6 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Bookmark className="w-8 h-8 text-blue-600" fill="currentColor" />
          Saved Reading
        </h1>
        <p className="text-gray-500 mt-2">Articles you have bookmarked for later.</p>
      </div>

      {savedArticles.length === 0 ? (
        <div className="text-center bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-12">
          <p className="text-gray-500 mb-4">You haven't saved any articles yet.</p>
          <Link href="/" className="text-blue-600 font-medium hover:underline">Explore Feed</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {savedArticles.map((article) => (
            <PostCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}