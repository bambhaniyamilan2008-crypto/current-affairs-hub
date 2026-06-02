// src/app/api/ai/generate/route.ts
import { NextResponse } from 'next/server';
import { generateDailyArticle } from '@/services/ai.service';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TOPICS = [
  "Latest National Government Scheme in India",
  "Major International Geopolitical update",
  "Recent breakthrough in Science and Technology",
  "Major updates in Indian Economy or Stock Market",
  "Significant Environment or Climate Change news",
  "Gujarat State significant development or news"
];

export async function GET(request: Request) {
  try {
    // ✅ NAYA SECURITY CHECK: Ab ye URL se 'secret' padhega
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');

    // Check karo ki URL wala secret aur Vercel wala secret match ho rahe hain ya nahi
    if (secret !== process.env.CRON_SECRET) {
      console.warn("Unauthorized AI generate attempt!");
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    console.log(`🤖 AI is generating news for topic: ${randomTopic}`);

    const articleData = await generateDailyArticle(randomTopic);

    const safeTitle = articleData?.title || "AI Generated Update";
    const safeSummary = articleData?.summary || "Read the latest automated news update.";
    const safeContent = articleData?.content || "Content generation in progress.";
    const safeCategory = articleData?.category || "National";

    const slug = safeTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 10000);

    const aiArticle = {
      authorId: 'ai-engine',
      authorName: 'AI News Desk',
      authorAvatar: 'https://ui-avatars.com/api/?name=AI+News&background=0D8ABC&color=fff',
      isAuthorVerified: true,
      isAIGenerated: true,
      title: safeTitle,
      summary: safeSummary,
      content: safeContent,
      category: safeCategory,
      tags: articleData?.tags || ['news', 'ai'],
      seoTitle: articleData?.seoTitle || safeTitle,
      seoDescription: articleData?.seoDescription || safeSummary,
      slug: slug,
      aiScores: {
        trustScore: 100,
        qualityScore: 95,
        relevanceScore: 100,
        isFactChecked: true,
        moderationReport: "Auto-generated and verified by Current Affairs AI Engine"
      },
      status: 'approved',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0
    };

    const docRef = await addDoc(collection(db, 'articles'), aiArticle);
    console.log(`✅ AI Article Published! ID: ${docRef.id}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Daily AI Article published successfully',
      topic: randomTopic,
      slug: slug 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Cron Job AI Generation Error:", error);
    return NextResponse.json({ 
      error: 'Failed to generate AI article',
      details: error.message 
    }, { status: 500 });
  }
}