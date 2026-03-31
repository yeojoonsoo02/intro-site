'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import VisitorCount from '@/features/visitors/VisitorCount';
import FlippableProfileCard from '@/features/profile/FlippableProfileCard';

const AuthButton = dynamic(() => import('@/features/auth/AuthButton'), {
  ssr: false,
});

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [angle, setAngle] = useState(0);

  return (
    <main className="max-w-xl mx-auto p-4 sm:p-6 text-center sm:min-h-[calc(100dvh-3.5rem)] sm:flex sm:flex-col">
      {angle >= 1000 && <AuthButton onAdminChange={setIsAdmin} visible />}

      <div className="sm:flex-1 sm:flex sm:flex-col sm:justify-center">
        <FlippableProfileCard isAdmin={isAdmin} onAngleChange={setAngle} />
      </div>

      <div className="pb-4 sm:pb-8">
        <VisitorCount />
      </div>
    </main>
  );
}
