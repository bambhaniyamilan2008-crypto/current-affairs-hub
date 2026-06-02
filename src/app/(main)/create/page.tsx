// src/app/(main)/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, CheckCircle2, Image as ImageIcon, Link as LinkIcon, Loader2, Send } from 'lucide-react';
import { CategoryType } from '@/types';
// ✅ Naye Firebase imports add kiye
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CATEGORIES: CategoryType[] = [
  'National', 'International', 'Gujarat', 'Economy', 
  'Science & Technology', 'Sports', 'Environment', 
  'Government Schemes', 'Awards', 'Defence', 'Education', 'Health'
];

export default function CreatePostPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ status: 'idle' | 'publishing' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'National' as CategoryType,
    tags: '',
    sourceUrl: '',
    coverImage: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Please login to post!');

    setIsSubmitting(true);
    setSubmitStatus({ status: 'publishing', message: 'Publishing your article directly...' });

    try {
      // ✅ URL ke liye ek clean slug (link) generate kiya
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 10000);

      // ✅ Article ka data tayyar kiya (Bina AI ke, direct approved)
      const articleData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        sourceUrl: formData.sourceUrl,
        coverImage: formData.coverImage,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous User',
        authorAvatar: user.photoURL || '',
        slug: slug,
        status: 'approved', // Direct publish kar diya
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
      };

      // ✅ Seedha Firebase database mein save kar diya (No API needed)
      await addDoc(collection(db, 'articles'), articleData);

      setSubmitStatus({ status: 'success', message: 'Published successfully! Redirecting...' });
      
      // ✅ Post banne ke baad us article ke page par bhej diya
      setTimeout(() => router.push(`/article/${slug}`), 1500);

    } catch (error: any) {
      console.error("Submission error:", error);
      setSubmitStatus({ status: 'error', message: error.message || 'Something went wrong. Please try again.' });
      setIsSubmitting(false);
    }
  };

  if (authLoading) return <div className="p-10 text-center">Loading editor...</div>;
  
  if (!user) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold mb-4">You must be logged in to write an article</h2>
        <button onClick={() => router.push('/login')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Go to Login</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Article</h1>
        <p className="text-gray-500">Share news and updates instantly.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-950 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        
        {/* Title Input */}
        <div>
          <input 
            type="text" 
            placeholder="Article Title..." 
            required
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white focus:ring-0 px-0"
          />
        </div>

        {/* Content Area */}
        <div>
          <textarea 
            placeholder="Write your article content here... (Markdown supported)" 
            required
            rows={10}
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            className="w-full resize-none text-lg bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-600 text-gray-800 dark:text-gray-200 focus:ring-0 px-0"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value as CategoryType})}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags (comma separated)</label>
            <input 
              type="text" 
              placeholder="e.g. isro, space, technology"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Source URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" /> Original Source URL (Optional)
            </label>
            <input 
              type="url" 
              placeholder="https://..."
              value={formData.sourceUrl}
              onChange={(e) => setFormData({...formData, sourceUrl: e.target.value})}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Status Banner */}
        {submitStatus.status !== 'idle' && (
          <div className={`p-4 rounded-xl flex items-start gap-3 border ${
            submitStatus.status === 'publishing' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800' :
            submitStatus.status === 'success' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800' :
            'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800'
          }`}>
            {submitStatus.status === 'publishing' && <Loader2 className="w-5 h-5 animate-spin mt-0.5" />}
            {submitStatus.status === 'success' && <CheckCircle2 className="w-5 h-5 mt-0.5" />}
            {submitStatus.status === 'error' && <AlertCircle className="w-5 h-5 mt-0.5" />}
            <div>
              <p className="font-medium text-sm">{submitStatus.message}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting || !formData.title || !formData.content}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Publish Article
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}