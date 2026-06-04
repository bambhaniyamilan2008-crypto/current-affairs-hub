// src/app/(main)/profile/[id]/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PostCard from '@/components/feed/PostCard';
import { MapPin, Link as LinkIcon, Calendar, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getUserProfile(userId: string) {
  // Yahan hum pehle fake data bhej rahe hain agar DB setup nahi hai, par DB check zarur karenge
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('uid', '==', userId), limit(1));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) return snapshot.docs[0].data();
  
  // Agar AI ya naya user hai jiska profile load nahi hua
  return {
    uid: userId,
    fullName: userId === 'ai-engine' ? 'AI News Desk' : 'Current Affairs User',
    bio: userId === 'ai-engine' ? 'Official AI Agent scanning thousands of sources to bring you fact-checked, rapid updates.' : 'Passionate about reading and sharing current affairs.',
    profilePic: userId === 'ai-engine' ? 'https://ui-avatars.com/api/?name=AI+News&background=0D8ABC&color=fff' : '/default-avatar.png',
    coverBanner: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop',
    location: 'India',
    followersCount: 1450,
    connectionsCount: 500,
    isVerified: userId === 'ai-engine',
    createdAt: Date.now()
  };
}

async function getUserArticles(userId: string) {
  const articlesRef = collection(db, 'articles');
  const q = query(articlesRef, where('authorId', '==', userId), orderBy('createdAt', 'desc'), limit(10));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

type PageProps = { params: Promise<{ id: string }> };

export default async function ProfilePage(props: PageProps) {
  const resolvedParams = await props.params;
  const profile = await getUserProfile(resolvedParams.id);
  const articles = await getUserArticles(resolvedParams.id) as any[];

  return (
    <div className="max-w-4xl mx-auto w-full pb-12">
      
      {/* 1. COVER BANNER */}
      <div className="relative h-48 md:h-64 w-full bg-blue-100 dark:bg-gray-800">
        <Image 
          src={profile.coverBanner || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop'} 
          alt="Cover Banner" fill className="object-cover" 
        />
      </div>

      {/* 2. PROFILE INFO SECTION (LinkedIn Style) */}
      <div className="relative px-4 sm:px-8 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 pb-8">
        
        {/* Profile Avatar Overlapping */}
        <div className="absolute -top-16 md:-top-20">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-gray-950 bg-white dark:bg-gray-900 overflow-hidden shadow-lg">
            <Image src={profile.profilePic} alt={profile.fullName} fill className="object-cover" />
          </div>
        </div>

        {/* Action Buttons (Connect/Follow) */}
        <div className="flex justify-end pt-4 pb-2">
          {resolvedParams.id !== 'ai-engine' && (
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full transition shadow-sm">
              Connect
            </button>
          )}
        </div>

        {/* User Details */}
        <div className="mt-2 md:mt-0">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            {profile.fullName}
            {profile.isVerified && <ShieldCheck className="w-6 h-6 text-blue-500" />}
          </h1>
          <p className="text-gray-800 dark:text-gray-300 text-lg mt-1 max-w-2xl">
            {profile.bio || 'News Enthusiast & Current Affairs Reader'}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-4">
            {profile.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {profile.location}</span>}
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> Joined {new Date(profile.createdAt).getFullYear()}</span>
          </div>

          <div className="flex items-center gap-4 mt-5 text-sm">
            <span className="text-gray-900 dark:text-white font-semibold">{profile.followersCount} <span className="text-gray-500 font-normal">Followers</span></span>
            <span className="text-gray-900 dark:text-white font-semibold">{profile.connectionsCount}{profile.connectionsCount === 500 ? '+' : ''} <span className="text-gray-500 font-normal">Connections</span></span>
          </div>
        </div>
      </div>

      {/* 3. USER'S POSTS (ACTIVITY) */}
      <div className="px-4 sm:px-8 mt-8">
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Activity & Posts</h2>
          
          {articles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Inhone abhi tak koi post nahi daali hai.</p>
          ) : (
            <div className="space-y-6">
              {articles.map(article => (
                <PostCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}