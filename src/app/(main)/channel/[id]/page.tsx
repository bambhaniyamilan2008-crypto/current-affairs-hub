// src/app/(main)/channel/[id]/page.tsx
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Channel, Article } from '@/types';
import PostCard from '@/components/feed/PostCard';
import { Users, Bell, Pin } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getChannelData(channelId: string) {
  // 1. Fetch Channel Details
  const channelRef = doc(db, 'channels', channelId);
  const channelSnap = await getDoc(channelRef);

  if (!channelSnap.exists()) {
    return null;
  }
  const channel = { id: channelSnap.id, ...channelSnap.data() } as Channel;

  // 2. Fetch Articles/Updates published in this channel
  const articlesRef = collection(db, 'articles');
  const q = query(
    articlesRef, 
    where('channelId', '==', channelId),
    orderBy('createdAt', 'desc')
  );
  const articlesSnap = await getDocs(q);
  
  // FIX 1: Timestamp conversion added so PostCard doesn't crash
  const articles = articlesSnap.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
    };
  }) as unknown as Article[];

  return { channel, articles };
}

// FIX 2: Next.js 15 params type update (Promise is required)
type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChannelPage({ params }: PageProps) {
  // FIX 3: Await the params before using it
  const { id } = await params;
  const data = await getChannelData(id);

  if (!data) {
    notFound();
  }

  const { channel, articles } = data;

  return (
    <div className="max-w-3xl mx-auto w-full py-6 px-4 sm:px-6">
      
      {/* Channel Header (Telegram Style) */}
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden mb-8 shadow-sm">
        {/* Banner */}
        <div className="h-32 sm:h-48 w-full relative bg-gradient-to-r from-blue-600 to-indigo-700">
          {channel.banner && (
            <Image 
              src={channel.banner} 
              alt={channel.name} 
              fill 
              className="object-cover opacity-90"
            />
          )}
        </div>

        {/* Info Area */}
        <div className="px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {channel.name}
            </h1>
            <p className="text-gray-500 mt-1 max-w-xl">
              {channel.description}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 font-medium">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" /> {channel.followersCount || 0} Subscribers
              </span>
            </div>
          </div>

          {/* Join/Mute Button */}
          <div className="w-full sm:w-auto flex gap-2">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-blue-700 transition">
              <Bell className="w-4 h-4" /> Join Channel
            </button>
          </div>
        </div>
      </div>

      {/* Pinned Post Section (If any) */}
      {channel.pinnedPostId && (
        <div className="mb-8">
          <div className="flex items-center gap-2 text-blue-600 font-medium mb-3 text-sm px-2">
            <Pin className="w-4 h-4" /> Pinned Message
          </div>
          {/* Render the pinned post here by finding it from the articles array */}
          {articles.filter(a => a.id === channel.pinnedPostId).map(pinnedArticle => (
            <div key={`pinned-${pinnedArticle.id}`} className="ring-2 ring-blue-500 rounded-2xl">
              <PostCard article={pinnedArticle} />
            </div>
          ))}
        </div>
      )}

      {/* Channel Feed */}
      <div>
        <h3 className="font-semibold text-gray-500 mb-4 px-2 uppercase tracking-wide text-sm">
          Latest Updates
        </h3>
        
        {articles.length === 0 ? (
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-10 text-center text-gray-500">
            No updates in this channel yet.
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <PostCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}