// src/hooks/useFCM.ts
'use client';

import { useEffect, useState } from "react";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "@/lib/firebase";

export function useFCM() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Check if cloud messaging service is supported inside current browser context
    try {
      const messaging = getMessaging(app);

      async function requestNotificationPermission() {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
          setFcmToken(token);
          // production inside append this token to your user's collection document via updateDoc
        }
      }

      requestNotificationPermission();

      // Setup global notification hook listener inside active app focus
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground real-time push message payload received:", payload);
        // Custom interactive toasts or custom audio elements can be triggered safely here
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase Cloud Messaging initialization context failed:", error);
    }
  }, []);

  return { fcmToken };
}