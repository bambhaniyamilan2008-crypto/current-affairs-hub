import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google Auth Avatars
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' }, // Firebase Storage
      { protocol: 'https', hostname: 'ui-avatars.com' }, // AI aur Default Avatars
      { protocol: 'https', hostname: 'image.pollinations.ai' }, // Free AI Cover Photos
      { protocol: 'https', hostname: 'images.unsplash.com' }, // Default Banners aur Stock Photos
    ],
  },
};

export default nextConfig;