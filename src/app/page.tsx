'use client';

import { useState } from 'react';
import CommentSection from '@/features/comments/CommentSection';
import VisitorCount from '@/features/visitors/VisitorCount';
import ProfileCard from '@/features/intro/ProfileCard';
import AuthButton from '@/features/auth/AuthButton';

export default function Home() {
  const [showComments, setShowComments] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <main className="max-w-xl mx-auto p-6 text-center">
      <AuthButton onAdminChange={setIsAdmin} />
      <ProfileCard />
      <div className="my-4">
        <VisitorCount />
      </div>
      <button
        className="mt-2 mb-4 w-full max-w-xs px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-base font-semibold"
        onClick={() => setShowComments(!showComments)}
      >
        {showComments ? '댓글 숨기기' : '💬 댓글 보기'}
      </button>
      {showComments && (
        <div className="w-full flex flex-col items-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-[color:var(--foreground)]">
            💬 <span className="font-extrabold">여준수의 댓글 공간</span>
          </h2>
          <CommentSection isAdmin={isAdmin} />
        </div>
      )}
    </main>
  );
}