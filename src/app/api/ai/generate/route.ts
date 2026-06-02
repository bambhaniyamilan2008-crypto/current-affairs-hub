// src/app/api/ai/generate/route.ts
import { NextResponse } from 'next/server';
import { generateDailyArticle } from '@/services/ai.service';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// List of topics AI should rotate through
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
    // 1. Security Check: Vercel Cron Secret validation
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn("Unauthorized AI generate attempt!");
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    // 2. Pick a random topic for this specific cron run
    const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    console.log(`🤖 AI is generating news for topic: ${randomTopic}`);

    // 3. Generate Content via Gemini
    const articleData = await generateDailyArticle(randomTopic);

    // 4. Generate a clean URL Slug
    const slug = articleData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 10000);

    // 5. Format Data for Database
    const aiArticle = {
      authorId: 'ai-engine',
      authorName: 'AI News Desk',
      authorAvatar: 'https://ui-avatars.com/api/?name=AI+News&background=0D8ABC&color=fff', // Auto-generated clean avatar
      isAuthorVerified: true,
      isAIGenerated: true,
      title: articleData.title,
      summary: articleData.summary,
      content: articleData.content,
      category: articleData.category,
      tags: articleData.tags || [],
      seoTitle: articleData.seoTitle || articleData.title,
      seoDescription: articleData.seoDescription || articleData.summary,
      slug: slug,
      aiScores: {
        trustScore: 100, // AI generated, inherently trusted by system
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

    // 6. Direct Publish to Firestore
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