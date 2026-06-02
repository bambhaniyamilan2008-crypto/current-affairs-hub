// src/components/feed/PostCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Share2, Bookmark, ShieldCheck, AlertTriangle } from 'lucide-react';
// ✅ Firebase ke saare zaroori functions import kar liye (setDoc, deleteDoc included)
import { doc, updateDoc, increment, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Article } from '@/types';

export default function PostCard({ article }: { article: Article }) {
  const { user } = useAuth();
  const router = useRouter();

  // State for interactive buttons
  const [likesCount, setLikesCount] = useState(article.likesCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Determine border color based on AI Trust Score
  const getTrustBorder = (score: number) => {
    if (score >= 90) return 'border-green-500';
    if (score >= 70) return 'border-blue-500';
    return 'border-orange-500';
  };

  // Safe date formatter (handles both Firebase Timestamp and ISO strings)
  const formattedDate = new Date(
    typeof article.createdAt === 'string' 
      ? article.createdAt 
      : article.createdAt?.toDate?.() || Date.now()
  ).toLocaleDateString();

  // Handle Like Action
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    
    if (!user) {
      alert('Please login to like articles!');
      return router.push('/login');
    }

    // Optimistic Update: UI turant change karo taaki lag na ho
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      // Firebase me background me update karo
      if (article.id) {
        const articleRef = doc(db, 'articles', article.id);
        await updateDoc(articleRef, {
          likesCount: increment(isLiked ? -1 : 1)
        });
      }
    } catch (error) {
      console.error("Error liking article:", error);
      // Agar error aaye toh UI ko wapas purani state me laao
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
    }
  };

  // Handle Share Action (Native Web Share API)
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    const articleUrl = `${window.location.origin}/article/${article.slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: articleUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback for desktop browsers without share menu
      await navigator.clipboard.writeText(articleUrl);
      alert('Article link copied to clipboard!');
    }
  };

  // ✅ COMPLETE FIREBASE BOOKMARK LOGIC
  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to save articles!');
      return;
    }

    // Optimistic UI update (Turant neela/safed hoga)
    setIsSaved(!isSaved);

    try {
      if (article.id) {
        // Firebase mein user ke 'saves' folder ka raasta
        const saveRef = doc(db, 'users', user.uid, 'saves', article.id);
        
        if (isSaved) {
          // Agar pehle se saved tha, toh hata do (Unsave)
          await deleteDoc(saveRef);
        } else {
          // Naya article Database mein save kar do
          await setDoc(saveRef, { savedAt: new Date() });
        }
      }
    } catch (error) {
      console.error("Error saving article:", error);
      // Error par wapas purana state kardo
      setIsSaved(isSaved);
    }
  };

  return (
    <article className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden mb-6 hover:shadow-md transition-shadow">
      
      {/* Header: Author & AI Badge */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-900">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${article.authorId}`}>
            <Image 
              src={article.authorAvatar || '/default-avatar.png'} 
              alt={article.authorName} 
              width={40} 
              height={40} 
              className="rounded-full border border-gray-200 dark:border-gray-800"
            />
          </Link>
          <div>
            <div className="flex items-center gap-1">
              <Link href={`/profile/${article.authorId}`} className="font-semibold text-gray-900 dark:text-white hover:underline">
                {article.authorName}
              </Link>
              {article.isAuthorVerified && (
                <ShieldCheck className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <p className="text-xs text-gray-500">
              {formattedDate} • {article.category}
            </p>
          </div>
        </div>

        {/* AI Trust Badge */}
        {article.aiScores?.isFactChecked && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full border bg-opacity-10 text-xs font-medium ${getTrustBorder(article.aiScores.trustScore)} ${article.aiScores.trustScore >= 90 ? 'bg-green-50 text-green-700 dark:text-green-400' : 'bg-orange-50 text-orange-700 dark:text-orange-400'}`}>
            {article.aiScores.trustScore >= 90 ? <ShieldCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            <span>AI Trust: {article.aiScores.trustScore}%</span>
          </div>
        )}
      </div>

      {/* Content */}
      <Link href={`/article/${article.slug}`} className="block p-4 group">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {article.summary || article.content?.substring(0, 150) + '...'}
        </p>
        
        {article.coverImage && (
          <div className="relative w-full h-64 rounded-xl overflow-hidden mb-4">
            <Image 
              src={article.coverImage} 
              alt={article.title} 
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {article.tags?.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md">
              #{tag}
            </span>
          ))}
        </div>
      </Link>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-900 flex items-center justify-between">
        <div className="flex items-center gap-6 text-gray-500">
          
          {/* Like Button */}
          <button 
            onClick={handleLike} 
            className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{likesCount}</span>
          </button>
          
          {/* Comment Button (Links to article page) */}
          <Link href={`/article/${article.slug}#comments`} className="flex items-center gap-2 hover:text-blue-500 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{article.commentsCount || 0}</span>
          </Link>
          
          {/* Share Button */}
          <button onClick={handleShare} className="flex items-center gap-2 hover:text-green-500 transition-colors">
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">{article.sharesCount || 0}</span>
          </button>

        </div>

        {/* Bookmark Button */}
        <button 
          onClick={handleBookmark} 
          className={`transition-colors ${isSaved ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>
    </article>
  );
}