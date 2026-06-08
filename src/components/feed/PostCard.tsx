// src/components/feed/PostCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Share2, Bookmark, ShieldCheck, AlertTriangle, MoreHorizontal } from 'lucide-react';
import { doc, updateDoc, increment, setDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Article } from '@/types';

export default function PostCard({ article }: { article: Article }) {
  const { user } = useAuth();
  const router = useRouter();

  // ✅ SAFE TYPE CASTING: Prevent build errors for likedBy
  const likedBy = (article as any).likedBy || [];
  const initialIsLiked = user?.uid ? likedBy.includes(user.uid) : false;

  const [likesCount, setLikesCount] = useState(article.likesCount || 0);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isSaved, setIsSaved] = useState(false);
  const [imgError, setImgError] = useState(false);

  const getTrustBorder = (score: number) => {
    if (score >= 90) return 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    if (score >= 70) return 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
    return 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
  };

  // ✅ BULLETPROOF DATE FORMATTER
  let formattedDate = 'Just now';
  try {
    if (article.createdAt) {
      const dateObj = typeof article.createdAt === 'string' 
        ? new Date(article.createdAt) 
        : article.createdAt?.toDate?.() || new Date();
      formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch (e) {
    console.error("Date parsing error", e);
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (!user) {
      alert('Please login to interact!');
      return router.push('/login');
    }
    
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

    try {
      if (article.id) {
        await updateDoc(doc(db, 'articles', article.id), {
          likesCount: increment(newIsLiked ? 1 : -1),
          likedBy: newIsLiked ? arrayUnion(user.uid) : arrayRemove(user.uid)
        });
      }
    } catch (error) {
      console.error("Like Error:", error);
      setIsLiked(!newIsLiked);
      setLikesCount(prev => newIsLiked ? prev - 1 : prev + 1);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    const articleUrl = `${window.location.origin}/article/${article.slug}`;
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      try { await navigator.share({ title: article.title, url: articleUrl }); } catch (err) {}
    } else {
      try {
        await navigator.clipboard.writeText(articleUrl);
        alert('✅ Link copied to clipboard!');
      } catch (err) {
        alert('Failed to copy link.');
      }
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return alert('Please login to save articles!');
    
    setIsSaved(!isSaved);
    try {
      if (article.id) {
        const saveRef = doc(db, 'users', user.uid, 'saves', article.id);
        isSaved ? await deleteDoc(saveRef) : await setDoc(saveRef, { savedAt: new Date(), articleId: article.id });
      }
    } catch (error) {
      console.error("Bookmark Error:", error);
      setIsSaved(isSaved);
    }
  };

  return (
    <article className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden mb-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-900">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${article.authorId}`} className="relative">
             <img 
              src={imgError ? '/default-avatar.png' : (article.authorAvatar || '/default-avatar.png')} 
              alt={article.authorName} 
              onError={() => setImgError(true)}
              className="w-11 h-11 rounded-full border-2 border-gray-100 dark:border-gray-800 object-cover shadow-sm"
            />
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <Link href={`/profile/${article.authorId}`} className="font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
                {article.authorName}
              </Link>
              {article.isAuthorVerified && <ShieldCheck className="w-4 h-4 text-blue-500" />}
            </div>
            <p className="text-xs text-gray-500 font-medium">
              {formattedDate} <span className="mx-1">•</span> {article.category}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {article.aiScores?.isFactChecked && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold shadow-sm ${getTrustBorder(article.aiScores.trustScore)}`}>
              {article.aiScores.trustScore >= 90 ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              <span>AI Trust: {article.aiScores.trustScore}%</span>
            </div>
          )}
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <Link href={`/article/${article.slug}`} className="block p-5 group">
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white mb-2.5 group-hover:text-blue-600 transition-colors leading-snug">
          {article.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-[15px] mb-5 line-clamp-3 leading-relaxed">
          {article.summary || article.content?.substring(0, 180) + '...'}
        </p>
        
        {article.coverImage && (
          <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-5 bg-gray-100 dark:bg-gray-900 shadow-inner">
             <img 
              src={article.coverImage} 
              alt={article.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {article.tags?.map(tag => (
            <span key={tag} className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              #{tag}
            </span>
          ))}
        </div>
      </Link>

      {/* Footer Actions */}
      <div className="px-5 py-3.5 border-t border-gray-100 dark:border-gray-900 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/20">
        <div className="flex items-center gap-6 md:gap-8 text-gray-500">
          <button onClick={handleLike} className={`flex items-center gap-2 group transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}>
            <div className={`p-2 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors ${isLiked ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
              <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${isLiked ? 'fill-current scale-110' : ''}`} />
            </div>
            <span className="text-sm font-bold">{likesCount}</span>
          </button>
          
          <Link href={`/article/${article.slug}#comments`} className="flex items-center gap-2 group hover:text-blue-500 transition-colors">
            <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
              <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-sm font-bold">{article.commentsCount || 0}</span>
          </Link>
          
          <button onClick={handleShare} className="flex items-center gap-2 group hover:text-green-500 transition-colors">
            <div className="p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20 transition-colors">
              <Share2 className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-sm font-bold hidden sm:inline">Share</span>
          </button>
        </div>

        <button onClick={handleBookmark} className={`group transition-colors ${isSaved ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
          <div className={`p-2 rounded-full transition-colors ${isSaved ? 'bg-blue-50 dark:bg-blue-900/20' : 'group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20'}`}>
            <Bookmark className={`w-5 h-5 transition-transform group-hover:scale-110 ${isSaved ? 'fill-current' : ''}`} />
          </div>
        </button>
      </div>
    </article>
  );
}