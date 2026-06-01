// src/app/admin/moderation/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Article } from '@/types';
import { ShieldCheck, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

export default function AdminModerationPage() {
  const [flaggedArticles, setFlaggedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlaggedPipeline() {
      try {
        const q = query(
          collection(db, 'articles'),
          where('status', '==', 'pending_moderation')
        );
        const snap = await getDocs(q);
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Article[];
        setFlaggedArticles(items);
      } catch (error) {
        console.error("Error collecting flagged stream records:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFlaggedPipeline();
  }, []);

  const handleOverrideStatus = async (id: string, decision: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'articles', id), { status: decision });
      setFlaggedArticles(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert("Database transaction action synchronization failure encountered.");
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-orange-600">
        <AlertTriangle className="w-6 h-6" /> Escalated System Flags Pipeline
      </h1>

      {flaggedArticles.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          Clear sky. No entries currently requesting operational intervention approvals.
        </div>
      ) : (
        <div className="space-y-4">
          {flaggedArticles.map(article => (
            <div key={article.id} className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{article.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">By Author profile node context link: {article.authorName}</p>
                </div>
                <span className="text-xs bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 px-3 py-1 rounded-full font-bold border border-red-200 dark:border-red-900">
                  Trust Indicator: {article.aiScores?.trustScore}%
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">{article.content}</p>
              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl text-xs text-gray-600 dark:text-gray-400 mb-4 border border-gray-100 dark:border-gray-900">
                <span className="font-bold text-red-600 dark:text-red-400">Gemini Telemetry Report Details: </span> 
                {article.aiScores?.moderationReport || "AI baseline parameters classification score analysis anomaly error warning issued."}
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => handleOverrideStatus(article.id, 'rejected')} className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                  <XCircle className="w-4 h-4" /> Hard Reject / Suppress View
                </button>
                <button onClick={() => handleOverrideStatus(article.id, 'approved')} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                  <ShieldCheck className="w-4 h-4" /> Bypass & Force Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}