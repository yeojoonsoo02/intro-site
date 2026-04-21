'use client';

import VisitorCount from '@/features/visitors/VisitorCount';
import FlippableProfileCard from '@/features/profile/FlippableProfileCard';

export default function HomeClient() {
  return (
    <main className="max-w-xl mx-auto p-4 sm:p-6 text-center sm:min-h-[calc(100dvh-3.5rem)] sm:flex sm:flex-col">
      <div className="sm:flex-1 sm:flex sm:flex-col sm:justify-center">
        <FlippableProfileCard />
      </div>

      <div className="pb-4 sm:pb-8">
        <VisitorCount />
      </div>
    </main>
  );
}
