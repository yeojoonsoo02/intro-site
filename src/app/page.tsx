'use client';

import { useState } from 'react';
import CommentSection from '@/features/comments/CommentSection';
import VisitorCount from '@/features/visitors/VisitorCount';
import FlippableProfileCard from '@/features/intro/FlippableProfileCard';
import AuthButton from '@/features/auth/AuthButton';

export default function Home() {
  const [showComments, setShowComments] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <main className="max-w-xl mx-auto p-6 text-center pb-24">
      <AuthButton onAdminChange={setIsAdmin} />
      <FlippableProfileCard />
      <div className="my-8">
        <VisitorCount />
      </div>
      <button
        className="mb-8 w-full max-w-xs px-4 py-3 bg-[color:var(--primary)] text-white rounded-[8px] hover:bg-[color:var(--button-hover)] transition text-base font-semibold"
        style={{ borderRadius: '8px' }}
        onClick={() => setShowComments(!showComments)}
      >
        {showComments ? '댓글 숨기기' : '💬 댓글 보기'}
      </button>
      {showComments && (
        <div className="w-full flex flex-col items-center">
          <h2 className="text-xl sm:text-2xl font-extrabold mb-6 text-center text-[#E4E4E7]">
            💬 여준수의 댓글 공간
          </h2>
          <CommentSection isAdmin={isAdmin} />
        </div>
      )}
    </main>
  );
}