// src/app/(main)/page.tsx
import { getHomeFeed } from '@/services/db.service';
import PostCard from '@/components/feed/PostCard';
import { Article } from '@/types'; // Import Article type
import Link from 'next/link'; // Import Link for navigation

export const dynamic = 'force-dynamic';

export default async function HomeFeed() {
  // FIX 1: TypeScript type assign kiya
  let articles: Article[] = []; 
  let error = null;

  try {
    const feedData = await getHomeFeed();
    
    // FIX 2: Firestore Timestamp ko Next.js friendly format mein convert kiya
    articles = feedData.articles.map((article: any) => ({
      ...article,
      // Converting complex Firestore timestamps to simple ISO strings
      createdAt: article.createdAt?.toDate ? article.createdAt.toDate().toISOString() : new Date().toISOString(),
      updatedAt: article.updatedAt?.toDate ? article.updatedAt.toDate().toISOString() : new Date().toISOString(),
    }));

  } catch (err) {
    console.error("Failed to load feed:", err);
    error = "Could not load the feed. Please try again later.";
  }

  return (
    <div className="max-w-2xl mx-auto w-full py-6 px-4 sm:px-6">
      
      {/* FIX 3: Button ki jagah Link add kiya taaki create page par ja sake */}
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 mb-8 flex items-center gap-4 shadow-sm">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full flex-shrink-0" />
        <Link 
          href="/create" 
          className="flex-1 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-left px-4 py-3 rounded-full text-gray-500 text-sm transition-colors block"
        >
          Share a current affairs update or write an article...
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <hr className="flex-1 border-gray-200 dark:border-gray-800" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top News & Updates</span>
        <hr className="flex-1 border-gray-200 dark:border-gray-800" />
      </div>

      {error ? (
        <div className="text-center text-red-500 p-4 bg-red-50 rounded-xl">
          {error}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No articles published yet. Check back soon!
        </div>
      ) : (
        <div className="space-y-6">
          {articles.map((article) => (
            <PostCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}