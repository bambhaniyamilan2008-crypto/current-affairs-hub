// src/app/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserProfile } from '@/types';
import { Globe, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  // 1. Email/Password Signup (Waisa ka waisa hi chhod diya)
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.fullName });

      const baseUsername = formData.email.split('@')[0].toLowerCase() + Math.floor(Math.random() * 1000);
      
      const newProfile: UserProfile = {
        uid: user.uid,
        fullName: formData.fullName,
        username: baseUsername,
        email: formData.email,
        profilePic: '',
        followersCount: 0,
        followingCount: 0,
        connectionsCount: 0,
        totalPosts: 0,
        isVerified: false,
        role: 'user',
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', user.uid), newProfile);
      
      router.push('/');
    } catch (err: any) {
      console.error("Registration Error:", err);
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Google Magic Auth (Sign In + Sign Up dono ek saath)
  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile already exists
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      // Agar naya user hai (Google se pehli baar aaya hai), toh profile banao
      if (!userSnap.exists()) {
        // ✅ ISSE REPLACE KAR DO:
const baseUsername = user.email 
  ? user.email.split('@')[0].toLowerCase() + Math.floor(Math.random() * 1000) 
  : user.uid.toLowerCase().slice(0, 8);
  
        const newProfile: UserProfile = {
          uid: user.uid,
          fullName: user.displayName || 'Anonymous User',
          username: baseUsername,
          email: user.email || '',
          profilePic: user.photoURL || '',
          followersCount: 0,
          followingCount: 0,
          connectionsCount: 0,
          totalPosts: 0,
          isVerified: false,
          role: 'user',
          createdAt: serverTimestamp(),
        };

        await setDoc(userRef, newProfile);
      }
      
      // Sab set hone ke baad feed pe le jao
      router.push('/');
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError(err.message || 'Google Auth failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="p-8">
          
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Globe className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">Join the Hub</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-center text-sm">
            Create your account to connect and share current affairs.
          </p>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">{error}</div>}

          {/* Quick Google Auth Button */}
          <button
            onClick={handleGoogleAuth} disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white px-4 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition mb-6 shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.02 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-800"></div></div>
            <span className="relative bg-white dark:bg-gray-900 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Or register with email</span>
          </div>

          <form onSubmit={handleEmailRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input 
                type="text" required
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input 
                type="email" required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input 
                type="password" required minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition"
              />
            </div>
            <button 
              type="submit" disabled={loading}
              className="w-full bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-black text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Sign Up with Email'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}