// src/app/api/ai/moderate/route.ts
import { NextResponse } from "next/server";
import { moderateUserPost } from "@/services/ai.service";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const { articleId, title, content, sourceUrl } = await req.json();

    if (!articleId || !title || !content) {
      return NextResponse.json({ error: "Required structural parameters missing." }, { status: 400 });
    }

    // Evaluate textual context via internal Gemini engine
    const aiScores = await moderateUserPost(title, content, sourceUrl);
    const articleRef = doc(db, "articles", articleId);

    // Auto flag rules implementation if criteria falls out of trust threshold parameters
    const updatedStatus = aiScores.trustScore < 50 ? "pending_moderation" : "approved";

    await updateDoc(articleRef, {
      aiScores,
      status: updatedStatus
    });

    return NextResponse.json({ success: true, aiScores, status: updatedStatus }, { status: 200 });
  } catch (error: any) {
    console.error("AI automated routine verification failure:", error);
    return NextResponse.json({ error: "Internal engine server exception handling." }, { status: 500 });
  }
}