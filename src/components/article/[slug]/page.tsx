import { getArticleBySlug } from '@/services/db.service';
import { notFound } from 'next/navigation';

// Next.js 15: params and searchParams are now Promises
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
      <div className="prose dark:prose-invert max-w-none">
        {/* Yahan aapka article content display hoga */}
        <p>{article.content}</p>
      </div>
    </div>
  );
}

// Metadata generate karne ke liye bhi Promise zaroori hai
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return {
    title: `Article | ${slug}`,
  };
}