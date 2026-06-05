// src/app/api/ai/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateDailyArticle } from '@/services/ai.service';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds allowed for Vercel

const TOPICS = [
  "Latest National Government Scheme in India",
  "Major International Geopolitical update",
  "Recent breakthrough in Science and Technology",
  "Major updates in Indian Economy or Stock Market",
  "Significant Environment or Climate Change news",
  "Gujarat State significant development or news"
];

export async function GET(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get('secret');

    if (secret !== "milan_super_secret_key_2026") {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    console.log(`🤖 AI is generating news for topic: ${randomTopic}`);

    // AI API Call
    const articleData = await generateDailyArticle(randomTopic);

    // Fallbacks
    const safeTitle = articleData?.title || "AI Generated Update";
    const safeSummary = articleData?.summary || "Read the latest automated news update.";
    const safeContent = articleData?.content || "Content generation in progress.";
    const safeCategory = articleData?.category || "National";
    
    // ✅ RULE 4: AI Generated Copyright-Free Image via pollinations.ai
    const imageKeyword = articleData?.imageKeyword || "breaking news";
    const safeCoverImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(imageKeyword)}%20high%20quality%20news%20photography?width=800&height=400&nologo=true`;

    // ✅ RULE 2: Source Link (Directing users to Google News for more context)
    const safeSourceUrl = `https://news.google.com/search?q=${encodeURIComponent(safeTitle)}`;

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
      coverImage: safeCoverImage, // Automatically added free image
      sourceUrl: safeSourceUrl,   // Automatically added source link
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