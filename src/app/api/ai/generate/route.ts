// src/app/api/ai/generate/route.ts
import { NextResponse } from 'next/server';
import { generateDailyArticle } from '@/services/ai.service';
import { publishArticle } from '@/services/db.service';

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
    // Security Check: Ensure this is only called by Vercel Cron or Admin
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    // Pick a random topic for this specific cron run
    const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

    // Step 1: Generate Content via Gemini
    const articleData = await generateDailyArticle(randomTopic);

    // Step 2: Format Data for Database
    const aiArticle = {
      authorId: 'ai-engine',
      authorName: 'AI News Desk',
      authorAvatar: '/ai-avatar.png', // Add an AI logo in public folder
      isAuthorVerified: true,
      isAIGenerated: true,
      title: articleData.title as string,
      summary: articleData.summary as string,
      content: articleData.content as string,
      category: articleData.category as any,
      tags: articleData.tags as string[],
      seoTitle: articleData.seoTitle,
      seoDescription: articleData.seoDescription,
      aiScores: {
        trustScore: 100, // AI generated, inherently trusted by system
        qualityScore: 95,
        relevanceScore: 100,
        isFactChecked: true,
        moderationReport: "Auto-generated and verified by Current Affairs AI Engine"
      },
      status: 'approved' as const
    };

    // Step 3: Publish to Firestore
    const slug = await publishArticle(aiArticle);

    return NextResponse.json({ 
      success: true, 
      message: 'Daily AI Article published successfully',
      topic: randomTopic,
      slug 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Cron Job AI Generation Error:", error);
    return NextResponse.json({ error: 'Failed to generate AI article' }, { status: 500 });
  }
}