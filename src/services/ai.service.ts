// src/services/ai.service.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIScores, Article } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const moderateUserPost = async (title: string, content: string, sourceUrl?: string): Promise<AIScores> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } as any });
  const prompt = `You are an expert AI Moderator... Analyze: Title: "${title}", Content: "${content}". Return ONLY JSON... { "trustScore": number, "qualityScore": number, "relevanceScore": number, "isFactChecked": boolean, "moderationReport": string }`;
  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    throw new Error("Failed to moderate content");
  }
};

export const generateDailyArticle = async (topic: string): Promise<any> => {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' } as any 
  });

  const prompt = `
    Act as a professional, unbiased journalist for a short-news app. 
    Write a highly engaging current affairs article about: "${topic}".
    
    FOLLOW THESE STRICT RULES:
    1. ANTI-PLAGIARISM: Write entirely in your own words. Do not copy any sentences from any source.
    2. WORD LIMIT: The 'content' field MUST be strictly between 60 to 100 words. Keep it crisp like an Inshorts card.
    3. IMAGE KEYWORD: Generate a highly specific 2-word keyword based on the topic (e.g., "space rocket", "stock market") to fetch a copyright-free image.

    Return ONLY a valid JSON object matching this structure without any markdown formatting:
    {
      "title": "Clear, professional headline",
      "summary": "2-line engaging summary",
      "content": "Full plagiarism-free article content (60-100 words)",
      "category": "Must be one of: National, International, Gujarat, Economy, Science & Technology, Sports, Environment, Government Schemes, Awards, Defence, Education, Health",
      "tags": ["tag1", "tag2"],
      "imageKeyword": "2-word specific keyword",
      "seoTitle": "SEO optimized title",
      "seoDescription": "SEO meta description"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // ✅ ASLI JADU: Agar AI galti se markdown add kar de, toh use saaf kar do
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Article Generation Error or Parsing Error:", error);
    throw new Error("Failed to generate article");
  }
};