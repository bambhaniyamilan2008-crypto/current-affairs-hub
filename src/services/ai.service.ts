// src/services/ai.service.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIScores, Article } from '@/types';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const moderateUserPost = async (
  title: string, 
  content: string, 
  sourceUrl?: string
): Promise<AIScores> => {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' } 
  });

  const prompt = `
    You are an expert AI Moderator for a Current Affairs platform.
    Analyze the following submission:
    Title: "${title}"
    Content: "${content}"
    Source: "${sourceUrl || 'No source provided'}"

    Evaluate based on: Fake news, political hate, relevance to current affairs, and spam.
    Return ONLY a valid JSON object with the following schema:
    {
      "trustScore": number (0-100),
      "qualityScore": number (0-100),
      "relevanceScore": number (0-100),
      "isFactChecked": boolean,
      "moderationReport": string (short reason for scores)
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const scores: AIScores = JSON.parse(responseText);
    return scores;
  } catch (error) {
    console.error("AI Moderation Error:", error);
    throw new Error("Failed to moderate content");
  }
};

export const generateDailyArticle = async (topic: string): Promise<Partial<Article>> => {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' } 
  });

  const prompt = `
    Act as a professional journalist. Write a factual, engaging current affairs article about "${topic}".
    The tone must be neutral and informative.
    Return ONLY a valid JSON object matching this structure:
    {
      "title": "Clear, professional headline",
      "summary": "2-line summary",
      "content": "Full article content in markdown format",
      "category": "Must be one of: National, International, Gujarat, Economy, Science & Technology, Sports, Environment, Government Schemes, Awards, Defence, Education, Health",
      "tags": ["tag1", "tag2", "tag3"],
      "seoTitle": "SEO optimized title",
      "seoDescription": "SEO meta description"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const articleData = JSON.parse(result.response.text());
    return articleData;
  } catch (error) {
    console.error("AI Article Generation Error:", error);
    throw new Error("Failed to generate article");
  }
};