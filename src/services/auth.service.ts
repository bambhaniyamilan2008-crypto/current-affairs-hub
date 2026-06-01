// src/services/auth.service.ts
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { UserProfile } from '@/types';

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user profile already exists in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // First time login - Create a new profile
      const baseUsername = user.email?.split('@')[0] || `user_${user.uid.substring(0, 5)}`;
      
      const newProfile: UserProfile = {
        uid: user.uid,
        fullName: user.displayName || 'New User',
        username: baseUsername.toLowerCase(),
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

      await setDoc(userDocRef, newProfile);
    }

    return user;
  } catch (error) {
    console.error("Google Login Error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
};