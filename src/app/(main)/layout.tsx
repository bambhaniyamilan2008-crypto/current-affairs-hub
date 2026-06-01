// src/app/(main)/layout.tsx
import Navbar from '@/components/shared/Navbar';
import Sidebar from '@/components/shared/Sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100">
      {/* Top Navigation */}
      <Navbar />
      
      <div className="max-w-7xl mx-auto flex w-full">
        {/* Left Sidebar - Hidden on smaller screens */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 w-full min-h-[calc(100vh-4rem)] border-x border-transparent md:border-gray-200 md:dark:border-gray-800 bg-white dark:bg-gray-950">
          {children}
        </main>

        {/* Right Sidebar - For Trends/Suggestions (Hidden on smaller screens) */}
        <aside className="hidden lg:block w-80 p-4 h-[calc(100vh-4rem)] sticky top-16">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Trending Topics</h3>
            
            {/* Placeholder for trending items - We can fetch real data here later */}
            <div className="space-y-4">
              <div className="text-sm">
                <p className="text-gray-500 text-xs">#Technology</p>
                <p className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 cursor-pointer">AI Regulation Act 2026</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-500 text-xs">#Economy</p>
                <p className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 cursor-pointer">Market hits new ATH</p>
              </div>
            </div>
            
          </div>
        </aside>
      </div>
    </div>
  );
}