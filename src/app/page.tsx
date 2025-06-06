'use client';

import { useState, useEffect } from 'react';
import CommentSection from '@/features/comments/CommentSection';
import VisitorCount from '@/features/visitors/VisitorCount';
import IntroCard from '@/features/intro/IntroCard';
import SocialLinks from '@/features/intro/SocialLinks';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import AuthButton from '@/features/auth/AuthButton';

export default function Home() {
  const [showComments, setShowComments] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <main className="max-w-xl mx-auto p-6 text-center">
      <AuthButton onAdminChange={setIsAdmin} />
      <IntroCard />
      <SocialLinks />
      <VisitorCount />

      <button
        className="mt-6 mb-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        onClick={() => setShowComments(!showComments)}
      >
        {showComments ? '댓글 숨기기' : '💬 댓글 보기'}
      </button>

      {showComments && (
        <div className="text-left">
          <h2 className="text-2xl font-bold mb-4">💬 여준수의 댓글 공간</h2>
          <CommentSection isAdmin={isAdmin} />
        </div>
      )}
    </main>
  );
}