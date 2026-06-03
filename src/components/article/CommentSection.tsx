// src/components/article/CommentSection.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Send, Loader2, MessageSquareOff } from 'lucide-react';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: any;
}

export default function CommentSection({ articleId }: { articleId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ✅ 100% SAFE CHECK: TypeScript ki error hatane ke liye variables yahan bana diye
  // Ab ye Firebase ke 'photoURL' ya custom 'profilePic' dono ko aaram se samajh lega
  const safeUserName = user ? ((user as any).fullName || user.displayName || 'User') : 'User';
  const safeUserAvatar = user ? ((user as any).profilePic || user.photoURL || '/default-avatar.png') : '/default-avatar.png';

  // Real-time listener: Jaise hi koi naya comment aayega, ye turant update hoga
  useEffect(() => {
    const commentsRef = collection(db, 'articles', articleId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      
      setComments(fetchedComments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!user) {
      alert('Bhai, pehle login karna padega!');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Comment ko article ke andar 'comments' folder mein save karo
      await addDoc(collection(db, 'articles', articleId, 'comments'), {
        userId: user.uid,
        userName: safeUserName,     // ✅ Safe variable use kiya
        userAvatar: safeUserAvatar, // ✅ Safe variable use kiya
        content: newComment.trim(),
        createdAt: serverTimestamp()
      });

      // 2. Article ke main document mein commentsCount badhao (+1)
      await updateDoc(doc(db, 'articles', articleId), {
        commentsCount: increment(1)
      });

      setNewComment(''); // Input box khali kar do
    } catch (error) {
      console.error("Error posting comment:", error);
      alert('Comment post nahi ho paya, dobara try karo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Input Box */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-10 relative">
          <div className="flex gap-4 items-start">
            <Image 
              src={safeUserAvatar} // ✅ Safe variable use kiya
              alt="You" 
              width={40} height={40} 
              className="rounded-full border border-gray-200 dark:border-gray-800 flex-shrink-0"
            />
            <div className="flex-1 relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Aapke kya vichar hain is news par?..."
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                rows={3}
              />
              <button 
                type="submit" 
                disabled={!newComment.trim() || submitting}
                className="absolute bottom-4 right-4 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:hover:text-gray-400 transition"
              >
                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center border border-blue-100 dark:border-blue-900/50">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-2">Join the conversation</h3>
          <p className="text-blue-600 dark:text-blue-300 mb-4 text-sm">Aapko apna vichar rakhne ke liye login karna hoga.</p>
          <Link href="/login" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
            Log In to Comment
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div>
        <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
          Comments <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-sm">{comments.length}</span>
        </h3>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10">
            <MessageSquareOff className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">Abhi tak kisi ne comment nahi kiya. Pehla comment aap karein!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <Link href={`/profile/${comment.userId}`} className="flex-shrink-0">
                  <Image 
                    src={comment.userAvatar || '/default-avatar.png'} 
                    alt={comment.userName} 
                    width={40} height={40} 
                    className="rounded-full border border-gray-200 dark:border-gray-800"
                  />
                </Link>
                <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-2xl rounded-tl-none p-4 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-1">
                    <Link href={`/profile/${comment.userId}`} className="font-semibold text-sm text-gray-900 dark:text-white hover:underline">
                      {comment.userName}
                    </Link>
                    <span className="text-xs text-gray-400">
                      {comment.createdAt?.toDate ? new Date(comment.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}