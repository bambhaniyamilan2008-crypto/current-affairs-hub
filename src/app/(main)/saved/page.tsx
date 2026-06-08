// src/app/(main)/saved/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, query, getDocs, documentId, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Article } from '@/types';
import PostCard from '@/components/feed/PostCard';
import { Bookmark, Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function SavedPage() {
  const { user, loading: authLoading } = useAuth();
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedArticles();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchSavedArticles = async () => {
    try {
      // 1. Fetch user's saved article IDs
      const savesRef = collection(db, 'users', user!.uid, 'saves');
      const savesSnap = await getDocs(query(savesRef, orderBy('savedAt', 'desc')));
      
      if (savesSnap.empty) {
        setSavedArticles([]);
        setLoading(false);
        return;
      }

      const savedIds = savesSnap.docs.map(doc => doc.id);

      // 2. Batch fetching (Firestore 'in' supports max 10)
      const chunks = [];
      for (let i = 0; i < savedIds.length; i += 10) {
        chunks.push(savedIds.slice(i, i + 10));
      }

      let allArticles: Article[] = [];
      const articlesRef = collection(db, 'articles');

      for (const chunk of chunks) {
        const q = query(articlesRef, where(documentId(), 'in', chunk));
        const chunkSnap = await getDocs(q);
        
        // ✅ BULLETPROOF: Safe date conversion to prevent PostCard crash
        const articles = chunkSnap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
          };
        }) as unknown as Article[];
        
        allArticles = [...allArticles, ...articles];
      }

      // Preserve original saved order
      const orderedArticles = savedIds
        .map(id => allArticles.find(a => a.id === id))
        .filter(Boolean) as Article[];

      setSavedArticles(orderedArticles);
    } catch (error) {
      console.error("Error fetching saved articles:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-2xl mx-auto w-full py-20 px-4 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Fetching your personal library...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm mt-6">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Bookmark className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Your Reading List</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">Sign in to save articles, read them offline, and build your personal knowledge base.</p>
        <Link href="/login" className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-bold rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
          Log In or Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full py-6 px-4 sm:px-6">
      <div className="mb-10 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-8 rounded-3xl border border-blue-100 dark:border-blue-900/30">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
          <Bookmark className="w-8 h-8 text-blue-600" fill="currentColor" />
          Saved Reading
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-medium">You have {savedArticles.length} articles bookmarked for later.</p>
      </div>

      {savedArticles.length === 0 ? (
        <div className="text-center bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-16 shadow-sm">
          <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100 dark:border-gray-800">
            <BookOpen className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Your library is empty</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Build your personal collection by tapping the bookmark icon on any article you want to read later.</p>
          <Link href="/" className="inline-flex px-8 py-3 rounded-full font-bold bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90 transition-opacity">
            Explore Latest News
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {savedArticles.map((article) => (
            <PostCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}