// src/services/db.service.ts
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs,
  getDoc, // <-- ADDED THIS 
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

// <-- NEW FUNCTION ADDED HERE -->
export const getArticleBySlug = async (slug: string): Promise<Article | null> => {
  try {
    // 1. Check if slug is directly the Document ID
    const docRef = doc(db, 'articles', slug);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        // Convert Firebase timestamps to strings for Next.js
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
      } as Article;
    }

    // 2. If not Document ID, query by 'slug' field
    const articlesRef = collection(db, 'articles');
    const q = query(articlesRef, where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const firstDoc = querySnapshot.docs[0];
      const data = firstDoc.data();
      
      return {
        id: firstDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
      } as Article;
    }

    return null; 
  } catch (error) {
    console.error("Error fetching article by slug:", error);
    return null;
  }
};