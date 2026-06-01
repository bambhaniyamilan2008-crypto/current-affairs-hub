import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import "./globals.css";
// Make sure globals.css is in the same src/app folder

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Current Affairs Hub',
  description: 'AI-Powered Current Affairs Social Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // FIX: Added suppressHydrationWarning to prevent strict Next.js hydration errors
    <html lang="en" suppressHydrationWarning className="antialiased">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}