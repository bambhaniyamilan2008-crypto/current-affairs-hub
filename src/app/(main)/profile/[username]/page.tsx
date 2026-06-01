// src/app/(main)/profile/[username]/page.tsx
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProfileBanner from '@/components/profile/ProfileBanner';
import PostCard from '@/components/feed/PostCard';
import { UserProfile, Article } from '@/types';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getProfileData(username: string) {
  // 1. First, find user ID from username
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username), limit(1));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const userDoc = querySnapshot.docs[0];
  const profile = userDoc.data() as UserProfile;

  // 2. Fetch their recent posts
  const postsRef = collection(db, 'articles');
  const postsQuery = query(
    postsRef, 
    where('authorId', '==', profile.uid),
    limit(5)
  );
  
  const postsSnapshot = await getDocs(postsQuery);
  const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Article[];

  return { profile, posts };
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  // Decode username just in case
  const decodedUsername = decodeURIComponent(params.username);
  const data = await getProfileData(decodedUsername);

  if (!data) {
    notFound();
  }

  const { profile, posts } = data;
  
  // Note: In a real app, check if current user matches profile.uid for edit rights
  const isOwnProfile = false; 

  return (
    <div className="max-w-4xl mx-auto w-full py-6 px-4 sm:px-6">
      
      <ProfileBanner profile={profile} isOwnProfile={isOwnProfile} />

      {/* Tabs */}
      <div className="mt-6 flex border-b border-gray-200 dark:border-gray-800">
        <button className="px-6 py-3 font-semibold text-blue-600 border-b-2 border-blue-600">
          Articles
        </button>
        <button className="px-6 py-3 font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition">
          Activity
        </button>
        <button className="px-6 py-3 font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition">
          About
        </button>
      </div>

      {/* Feed Content */}
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Recent Articles</h2>
        {posts.length === 0 ? (
          <div className="text-center text-gray-500 py-10 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
            No articles published yet.
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <PostCard key={post.id} article={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}