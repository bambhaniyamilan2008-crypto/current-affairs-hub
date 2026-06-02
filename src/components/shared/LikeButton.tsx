"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface LikeButtonProps {
  articleId: string;
  initialLikes: number;
}

export default function LikeButton({ articleId, initialLikes }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes || 0);

  // 🔥 Yahan hum check kar rahe hain ki kya user ne pehle is device par like kiya tha
  useEffect(() => {
    const hasLiked = localStorage.getItem(`liked_article_${articleId}`);
    if (hasLiked === "true") {
      setLiked(true);
    }
  }, [articleId]);

  const handleLike = async () => {
    // Agar pehle se like kar chuka hai, toh yahin rok do (return kar do)
    if (liked) return; 

    // 1. UI ko turant update karo (Optimistic Update - jisse app fast lage)
    setLiked(true);
    setLikesCount((prev) => prev + 1);
    
    // 2. Browser ki memory mein save kar do ki isne like kar diya hai
    localStorage.setItem(`liked_article_${articleId}`, "true");

    // 3. Firebase backend mein exactly +1 bhejo
    try {
      const articleRef = doc(db, "articles", articleId);
      await updateDoc(articleRef, {
        likesCount: increment(1)
      });
    } catch (error) {
      console.error("Error updating likes:", error);
      // Agar error aaye toh wapas pehle jaisa kar do
      setLiked(false);
      setLikesCount((prev) => prev - 1);
      localStorage.removeItem(`liked_article_${articleId}`);
    }
  };

  return (
    <button 
      onClick={handleLike} 
      disabled={liked} // Like hone ke baad button click band kar do
      className={`flex items-center gap-2 transition-all ${
        liked 
          ? "text-red-500 scale-110" 
          : "text-gray-600 dark:text-gray-300 hover:text-red-500 hover:scale-105"
      }`}
    >
      {/* Agar liked hai toh dil pura laal (fill) ho jayega */}
      <Heart className={`w-6 h-6 ${liked ? "fill-current text-red-500" : ""}`} />
      <span className="font-medium">{likesCount}</span>
    </button>
  );
}