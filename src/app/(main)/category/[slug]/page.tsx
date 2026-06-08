// src/app/(main)/category/[slug]/page.tsx
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Article } from '@/types';
import PostCard from '@/components/feed/PostCard';
import { Globe, Hash } from 'lucide-react';

export const dynamic = 'force-dynamic';

// Helper to convert URL slug to proper Category Type
const formatCategorySlug = (slug: string) => {
  const map: Record<string, string> = {
    'national': 'National',
    'international': 'International',
    'gujarat': 'Gujarat',
    'economy': 'Economy',
    'science-technology': 'Science & Technology',
    'sports': 'Sports',
    'environment': 'Environment',
    'government-schemes': 'Government Schemes',
    'awards': 'Awards',
    'defence': 'Defence',
    'education': 'Education',
    'health': 'Health'
  };
  return map[slug.toLowerCase()] || slug.charAt(0).toUpperCase() + slug.slice(1);
};

async function getCategoryArticles(categoryName: string) {
  const articlesRef = collection(db, 'articles');
  
  // Fetch only approved articles for this specific category
  const q = query(
    articlesRef,
    where('category', '==', categoryName),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  const snapshot = await getDocs(q);
  
  // ✅ FIX: Safe Date Conversion to prevent PostCard crash
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
    };
  }) as unknown as Article[];
}

// ✅ FIX: Next.js 15 official Promise rule
type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage(props: PageProps) {
  // ✅ FIX: Safely await the params Promise before using
  const resolvedParams = await props.params;
  const formattedCategory = formatCategorySlug(resolvedParams.slug);
  const articles = await getCategoryArticles(formattedCategory);

  return (
    <div className="max-w-2xl mx-auto w-full py-6 px-4 sm:px-6">
      
      {/* Category Header */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 mb-8 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center mb-3 shadow-sm">
          <Globe className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          {formattedCategory} News
        </h1>
        <p className="text-gray-500 text-sm max-w-md">
          Stay updated with the latest verified current affairs, articles, and insights related to {formattedCategory}.
        </p>
      </div>

      {/* Feed Divider */}
      <div className="flex items-center gap-4 mb-6">
        <hr className="flex-1 border-gray-200 dark:border-gray-800" />
        <span className="text-xs font-bold text-gray-500 flex items-center gap-1 uppercase tracking-wider">
          <Hash className="w-3 h-3" /> LATEST
        </span>
        <hr className="flex-1 border-gray-200 dark:border-gray-800" />
      </div>

      {/* Articles Feed */}
      {articles.length === 0 ? (
        <div className="text-center text-gray-500 py-16 bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No news found</h3>
          <p className="text-sm">No articles published in {formattedCategory} yet. Check back soon!</p>
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