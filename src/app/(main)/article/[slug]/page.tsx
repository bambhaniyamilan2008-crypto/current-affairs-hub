// src/app/(main)/article/[slug]/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Article } from '@/types';
import { ShieldCheck, AlertTriangle, Heart, MessageCircle, Share2, Bookmark, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getArticleBySlug(slug: string) {
  const articlesRef = collection(db, 'articles');
  const q = query(articlesRef, where('slug', '==', slug), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Article;
}

// FIX: Ab compiler ko Promise hi chahiye, toh humne exact official Promise type de diya
type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticlePage(props: PageProps) {
  // FIX: Runtime par props.params ko properly await kar liya
  const resolvedParams = await props.params;
  const article = await getArticleBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  // Determine trust badge styling
  const trustScore = article.aiScores?.trustScore || 0;
  let trustColor = 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400';
  let TrustIcon = AlertTriangle;

  if (trustScore >= 90) {
    trustColor = 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400';
    TrustIcon = ShieldCheck;
  } else if (trustScore >= 70) {
    trustColor = 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400';
    TrustIcon = ShieldCheck;
  }

  return (
    <article className="max-w-3xl mx-auto w-full py-8 px-4 sm:px-6 md:py-12">
      
      {/* Back Button & Category */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </Link>
        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-full">
          {article.category}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
        {article.title}
      </h1>

      {/* Author & Date Row */}
      <div className="flex items-center justify-between mb-8 py-4 border-y border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${article.authorId}`}>
            <Image 
              src={article.authorAvatar || '/default-avatar.png'} 
              alt={article.authorName} 
              width={48} 
              height={48} 
              className="rounded-full border border-gray-200 dark:border-gray-800"
            />
          </Link>
          <div>
            <Link href={`/profile/${article.authorId}`} className="font-semibold text-gray-900 dark:text-white hover:underline flex items-center gap-1">
              {article.authorName}
              {article.isAuthorVerified && <ShieldCheck className="w-4 h-4 text-blue-500" />}
              {article.isAIGenerated && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-1">AI Agent</span>}
            </Link>
            <p className="text-sm text-gray-500">
              {new Date(article.createdAt?.toDate?.() || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} 
              <span className="mx-2">•</span> 
              5 min read
            </p>
          </div>
        </div>

        {/* Action Buttons (Desktop) */}
        <div className="hidden sm:flex items-center gap-4 text-gray-500">
          <button className="hover:text-blue-500 transition"><Share2 className="w-5 h-5" /></button>
          <button className="hover:text-blue-500 transition"><Bookmark className="w-5 h-5" /></button>
        </div>
      </div>

      {/* AI Trust Badge Box */}
      {article.aiScores && (
        <div className={`mb-8 p-4 rounded-xl border flex items-start gap-3 ${trustColor}`}>
          <TrustIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold flex items-center gap-2">
              AI Verification Score: {trustScore}%
            </h4>
            <p className="text-sm mt-1 opacity-90">
              {article.aiScores.moderationReport || "This article has been automatically evaluated by our AI for accuracy and relevance."}
            </p>
          </div>
        </div>
      )}

      {/* Cover Image */}
      {article.coverImage && (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-10 border border-gray-100 dark:border-gray-900">
          <Image 
            src={article.coverImage} 
            alt={article.title} 
            fill 
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Article Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed mb-10 whitespace-pre-wrap">
        {article.content}
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          {article.tags.map(tag => (
            <Link key={tag} href={`/search?q=${tag}`} className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-800 transition">
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Original Source */}
      {article.sourceUrl && (
        <div className="mb-10 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500">
            Source: <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">{article.sourceUrl}</a>
          </p>
        </div>
      )}

      {/* Bottom Sticky Action Bar (Like, Comment, Share) */}
      <div className="sticky bottom-4 sm:bottom-8 mx-auto max-w-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-full px-6 py-3 flex items-center justify-between shadow-lg">
        <button className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition">
          <Heart className="w-6 h-6" />
          <span className="font-medium">{article.likesCount || 0}</span>
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>
        <button className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 transition">
          <MessageCircle className="w-6 h-6" />
          <span className="font-medium">{article.commentsCount || 0}</span>
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>
        <button className="text-gray-600 dark:text-gray-300 hover:text-green-500 transition">
          <Share2 className="w-6 h-6" />
        </button>
      </div>

    </article>
  );
}