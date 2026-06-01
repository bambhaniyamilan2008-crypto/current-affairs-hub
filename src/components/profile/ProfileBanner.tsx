// src/components/profile/ProfileBanner.tsx
'use client';

import Image from 'next/image';
import { ShieldCheck, MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import { UserProfile } from '@/types';

export default function ProfileBanner({ profile, isOwnProfile }: { profile: UserProfile, isOwnProfile: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Cover Banner */}
      <div className="h-48 w-full relative bg-gray-200 dark:bg-gray-800">
        {profile.coverBanner && (
          <Image 
            src={profile.coverBanner} 
            alt="Cover Banner" 
            fill 
            className="object-cover"
          />
        )}
      </div>

      <div className="px-6 pb-6 relative">
        {/* Profile Picture */}
        <div className="absolute -top-16 border-4 border-white dark:border-gray-950 rounded-full bg-white dark:bg-gray-900 w-32 h-32 overflow-hidden">
          <Image 
            src={profile.profilePic || '/default-avatar.png'} 
            alt={profile.fullName} 
            fill 
            className="object-cover"
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
          {isOwnProfile ? (
            <button className="px-5 py-2 rounded-full border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition">
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button className="px-5 py-2 rounded-full border border-blue-600 text-blue-600 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                Message
              </button>
              <button className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">
                Connect
              </button>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="mt-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {profile.fullName}
            {profile.isVerified && <ShieldCheck className="w-5 h-5 text-blue-500" />}
          </h1>
          <p className="text-gray-500 text-sm mb-4">@{profile.username}</p>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap max-w-2xl">
            {profile.bio || 'Current Affairs enthusiast.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {profile.location}
              </div>
            )}
            {profile.website && (
              <div className="flex items-center gap-1">
                <LinkIcon className="w-4 h-4" /> 
                <a href={profile.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Joined {new Date(profile.createdAt?.toDate?.() || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-gray-900">
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 dark:text-white">{profile.connectionsCount || 0}</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Connections</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 dark:text-white">{profile.followersCount || 0}</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Followers</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 dark:text-white">{profile.followingCount || 0}</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}