import { getArticleBySlug } from '@/services/db.service';
import { notFound } from 'next/navigation';

// FIX: TypeScript ko satisfy karne ke liye humne bataya ki params Promise bhi ho sakta hai ya normal object bhi
type PageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export default async function ArticlePage(props: PageProps) {
  // params ko safely await karenge
  const resolvedParams = await props.params;
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

// Metadata mein bhi same safe approach lagayenge
export async function generateMetadata(props: PageProps) {
  const resolvedParams = await props.params;
  return {
    title: `Article | ${resolvedParams.slug}`,
  };
}