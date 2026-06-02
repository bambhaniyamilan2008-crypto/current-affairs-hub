// src/types/index.ts

export type CategoryType =
  | 'National'
  | 'International'
  | 'Gujarat'
  | 'Economy'
  | 'Science & Technology'
  | 'Sports'
  | 'Environment'
  | 'Government Schemes'
  | 'Awards'
  | 'Defence'
  | 'Education'
  | 'Health';

export interface UserProfile {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  profilePic: string;
  coverBanner?: string;
  bio?: string;
  location?: string;
  website?: string;
  followersCount: number;
  followingCount: number;
  connectionsCount: number;
  totalPosts: number;
  isVerified: boolean;
  role: 'user' | 'admin';
  createdAt: any; // Firestore Timestamp
}

export interface AIScores {
  trustScore: number;       // 0 to 100
  qualityScore: number;     // 0 to 100
  relevanceScore: number;   // 0 to 100
  isFactChecked: boolean;
  moderationReport?: string;
}

export interface Article {
  id: string;
  authorId: string;         // 'ai-engine' or User UID
  authorName: string;
  authorAvatar: string;
  isAuthorVerified: boolean;
  isAIGenerated: boolean;
  
  title: string;
  slug: string;
  summary: string;
  content: string;          // Main body / key highlights
  coverImage?: string;
  sourceUrl?: string;       // Original source if user submitted or AI fetched
  category: CategoryType;
  tags: string[];
  
  // Interactions
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  
  // ✅ YAHAN ADD KIYA HAI: Users ki ID list jinhone like kiya hai
  likedBy?: string[]; 
  
  // AI Metrics
  aiScores: AIScores;
  status: 'approved' | 'pending_moderation' | 'rejected';
  
  // SEO Metadata
  seoTitle?: string;
  seoDescription?: string;
  
  createdAt: any;
  updatedAt: any;
}

export interface Channel {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  banner?: string;
  followersCount: number;
  createdAt: any;
  pinnedPostId?: string;
}

export interface ConnectionRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}