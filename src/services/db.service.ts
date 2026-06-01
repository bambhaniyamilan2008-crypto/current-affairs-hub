// src/services/db.service.ts
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where, 
  serverTimestamp, 
  startAfter,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Article, UserProfile } from '@/types';

// Generate a URL-friendly slug
const generateSlug = (title: string) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();
};

export const publishArticle = async (
  articleData: Omit<Article, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'likesCount' | 'commentsCount' | 'sharesCount' | 'savesCount'>
): Promise<string> => {
  try {
    const articleRef = doc(collection(db, 'articles'));
    const slug = generateSlug(articleData.title);

    const newArticle: Article = {
      ...articleData,
      id: articleRef.id,
      slug,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      savesCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(articleRef, newArticle);
    return slug;
  } catch (error) {
    console.error("Error publishing article:", error);
    throw error;
  }
};

export const getHomeFeed = async (
  lastVisible?: QueryDocumentSnapshot<DocumentData>, 
  pageSize = 10
) => {
  try {
    const articlesRef = collection(db, 'articles');
    
    // Fetch only approved or AI generated articles for the feed
    let q = query(
      articlesRef,
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }

    const snapshot = await getDocs(q);
    const articles = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Article[];

    return {
      articles,
      lastVisibleDoc: snapshot.docs[snapshot.docs.length - 1]
    };
  } catch (error) {
    console.error("Error fetching feed:", error);
    throw error;
  }
};