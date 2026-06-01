import React from 'react';
import Link from 'next/link';

interface ChannelProps {
  channel: {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    avatarUrl?: string;
  };
}

export default function ChannelCard({ channel }: ChannelProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {/* Channel Avatar */}
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
          {channel.avatarUrl ? (
            <img src={channel.avatarUrl} alt={channel.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-gray-400">{channel.name[0]}</span>
          )}
        </div>

        {/* Channel Info */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{channel.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {channel.memberCount.toLocaleString()} members
          </p>
        </div>

        {/* Action Button */}
        <Link 
          href={`/channel/${channel.id}`}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-full transition-colors"
        >
          View
        </Link>
      </div>
      
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
        {channel.description}
      </p>
    </div>
  );
}