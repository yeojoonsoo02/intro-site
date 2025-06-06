'use client';

import { useState } from 'react';
import CommentSection from '@/features/comments/CommentSection';
import VisitorCount from '@/features/visitors/VisitorCount';
import ProfileCard from '@/features/intro/ProfileCard';
import SocialLinks from '@/features/intro/SocialLinks';
import AuthButton from '@/features/auth/AuthButton';

export default function Home() {
  const [showComments, setShowComments] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <main className="max-w-md w-full mx-auto p-3 sm:p-6 text-center bg-white rounded-lg shadow-md min-h-screen flex flex-col items-center">
      <AuthButton onAdminChange={setIsAdmin} />
      <ProfileCard />
      <SocialLinks />
      <VisitorCount />

      <button
        className="mt-6 mb-4 w-full max-w-xs px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-base font-semibold"
        onClick={() => setShowComments(!showComments)}
      >
        {showComments ? '댓글 숨기기' : '💬 댓글 보기'}
      </button>

      {showComments && (
        <div className="w-full text-left">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-[color:var(--foreground)]">💬 여준수의 댓글 공간</h2>
          <CommentSection isAdmin={isAdmin} />
        </div>
      )}
    </main>
  );
}