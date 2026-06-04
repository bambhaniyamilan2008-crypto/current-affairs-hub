// src/app/(main)/channel/[id]/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ShieldCheck, ArrowLeft, Users, Share2, PlusCircle, Globe, FileText, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

// 1. Types Define Kiye
interface Channel {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  avatarUrl?: string;
  coverUrl?: string;
  isVerified?: boolean;
  website?: string;
}

interface ArticleInfo {
  id: string;
  title: string;
  slug: string;
  createdAt: any;
  coverImage?: string;
}

// 2. Channel Fetch Karne Ka Function
async function getChannelById(id: string) {
  try {
    const docRef = doc(db, 'channels', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Channel;
  } catch (error) {
    console.error("Error fetching channel:", error);
    return null;
  }
}

// 3. NAYA FUNCTION: Is Channel Ke Saare Articles Fetch Karne Ke Liye
async function getArticlesByChannel(channelId: string) {
  try {
    const articlesRef = collection(db, 'articles');
    // Maan lete hain ki tere articles collection mein 'authorId' ya 'channelId' save hota hai
    const q = query(
      articlesRef, 
      where('authorId', '==', channelId) 
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return [];
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ArticleInfo[];
  } catch (error) {
    console.error("Error fetching channel articles:", error);
    return [];
  }
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChannelPage(props: PageProps) {
  const resolvedParams = await props.params;
  
  // Dono cheezein ek sath fetch kar rahe hain (Fast loading ke liye)
  const channelData = getChannelById(resolvedParams.id);
  const articlesData = getArticlesByChannel(resolvedParams.id);

  const [channel, articles] = await Promise.all([channelData, articlesData]);

  if (!channel) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto w-full pb-12 sm:pb-16">
      
      {/* Cover Image Section */}
      <div className="relative w-full h-48 sm:h-64 md:h-80 bg-gray-200 dark:bg-gray-800 overflow-hidden">
        {channel.coverUrl ? (
          <Image 
            src={channel.coverUrl} 
            alt={`${channel.name} cover`} 
            fill 
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-80"></div>
        )}
        
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
          <Link href="/channel" className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-sm font-medium rounded-full transition">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </div>

      {/* Channel Info Header */}
      <div className="px-4 sm:px-8 max-w-3xl mx-auto -mt-16 sm:-mt-20 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          
          <div className="flex items-end gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white dark:bg-gray-900 p-1.5 shadow-lg border border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative">
                {channel.avatarUrl ? (
                  <Image src={channel.avatarUrl} alt={channel.name} fill className="object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-gray-400">{channel.name[0]}</span>
                )}
              </div>
            </div>

            {/* Name & Stats */}
            <div className="pb-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                {channel.name}
                {channel.isVerified && <ShieldCheck className="w-6 h-6 text-blue-500" />}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1.5 mt-1 sm:mt-2">
                <Users className="w-4 h-4" />
                {(channel.memberCount || 0).toLocaleString()} Members
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pb-2 sm:pb-4">
            <button className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-blue-500/20">
              <PlusCircle className="w-5 h-5" /> Join Channel
            </button>
            <button className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition border border-gray-200 dark:border-gray-700">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Description & Details */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About Channel</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {channel.description || "No description provided for this channel yet."}
          </p>

          {channel.website && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-400" />
              <a href={channel.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline font-medium">
                {channel.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        {/* NAYA SECTION: Channel Ke Articles Ki List */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-800 pb-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-500" /> Latest Updates
            </h2>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {articles.length} Posts
            </span>
          </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((article) => (
                <Link key={article.id} href={`/article/${article.slug}`}>
                  <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-all flex gap-4 h-full">
                    
                    {/* Article Thumbnail */}
                    <div className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden relative">
                      {article.coverImage ? (
                        <Image src={article.coverImage} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <FileText className="w-8 h-8 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    
                    {/* Article Details */}
                    <div className="flex flex-col justify-center">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-500 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(article.createdAt?.toDate?.() || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Agar channel par koi article nahi hai toh ye dikhega */
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <FileText className="w-12 h-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No articles yet</h3>
              <p className="text-gray-500 text-sm mt-1">This channel hasn't posted any updates.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}