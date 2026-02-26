'use client';

import { useState } from 'react';
import VisitorCount from '@/features/visitors/VisitorCount';
import FlippableProfileCard from '@/features/profile/FlippableProfileCard';
import AuthButton from '@/features/auth/AuthButton';

export const dynamic = "force-dynamic";

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [angle, setAngle] = useState(0);

  return (
    <main className="max-w-xl mx-auto p-4 sm:p-6 text-center pb-32">
      {angle >= 1000 && <AuthButton onAdminChange={setIsAdmin} visible />}

      <div className="mb-12">
        <FlippableProfileCard isAdmin={isAdmin} onAngleChange={setAngle} />
      </div>

      <div className="mb-8">
        <VisitorCount />
      </div>
    </main>
  );
}
