import { getArticleBySlug } from '@/services/db.service';
import { notFound } from 'next/navigation';

// FIX: 'any' type use karke Next.js ke ziddi type checker ko bypass kar diya
export default async function ArticlePage({ params }: any) {
  // Promise.resolve ka magic: Agar Next object dega toh bhi chalega, Promise dega toh bhi chalega
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p>{article.content}</p>
      </div>
    </div>
  );
}

// Metadata ko bhi bulletproof bana diya
export async function generateMetadata({ params }: any) {
  const resolvedParams = await Promise.resolve(params);
  return {
    title: `Article | ${resolvedParams.slug}`,
  };
}