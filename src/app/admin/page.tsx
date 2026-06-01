// src/app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Article } from '@/types';
import { ShieldAlert, Trash2, CheckCircle2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const fetchedArticles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Article[];
      setArticles(fetchedArticles);
    } catch (error) {
      console.error("Error fetching admin articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePost = async (id: string) => {
    if (!confirm('Are you sure you want to remove this post from the feed?')) return;
    
    try {
      // You can either delete it or change status to 'rejected'
      const articleRef = doc(db, 'articles', id);
      await updateDoc(articleRef, { status: 'rejected' });
      
      // Update UI
      setArticles(articles.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
    } catch (error) {
      console.error("Error removing post:", error);
      alert('Failed to remove post.');
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-xl">Loading Admin Data...</div>;

  const activeArticles = articles.filter(a => a.status === 'approved');
  const rejectedArticles = articles.filter(a => a.status === 'rejected');

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Content Moderation</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Posts</h3>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">{articles.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Live (Approved)</h3>
          <p className="text-4xl font-bold text-green-600">{activeArticles.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Removed by Admin</h3>
          <p className="text-4xl font-bold text-red-600">{rejectedArticles.length}</p>
        </div>
      </div>

      {/* Live Posts Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Live Articles Feed</h2>
          <span className="text-sm text-gray-500">Monitor AI scores and content</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Title & Author</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Category</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">AI Trust Score</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {activeArticles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white max-w-xs truncate">
                      {article.title}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      by {article.authorName} • {article.isAIGenerated ? 'AI Generated' : 'User'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1.5 font-medium ${
                      article.aiScores.trustScore >= 70 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {article.aiScores.trustScore >= 70 ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                      {article.aiScores.trustScore}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/article/${article.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-blue-600 transition">
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                      <button 
                        onClick={() => handleRemovePost(article.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition"
                        title="Remove Post"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {activeArticles.length === 0 && (
            <div className="p-8 text-center text-gray-500">No active posts to display.</div>
          )}
        </div>
      </div>
    </div>
  );
}