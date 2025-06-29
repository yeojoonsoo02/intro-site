'use client';

import { useState } from 'react';
import CommentSection from '@/features/comments/CommentSection';
import VisitorCount from '@/features/visitors/VisitorCount';
import FlippableProfileCard from '@/features/profile/FlippableProfileCard';
import AuthButton from '@/features/auth/AuthButton';

export const dynamic = "force-dynamic";

export default function Home() {
  const [showComments, setShowComments] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [angle, setAngle] = useState(0);

  return (
    <main className="max-w-xl mx-auto p-6 text-center pb-24">
      <div className="mb-4 flex justify-end bg-blue-50 dark:bg-gray-800/40 p-2 rounded-md">
        <a
          href="/login"
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium border border-blue-300 rounded-full bg-white text-blue-700 hover:bg-blue-100 transition"
        >
          <span>🔑</span> <span>Sign In</span>
        </a>
      </div>
      {/* 설정 버튼은 각도 1000도 이상일 때만 표시 */}
      {angle >= 1000 && <AuthButton onAdminChange={setIsAdmin} visible />}

      {/* 프로필 카드 */}
      <div className="mb-12">
        <FlippableProfileCard isAdmin={isAdmin} onAngleChange={setAngle} />
      </div>

      {/* 방문자 수 */}
      <div className="mb-8">
        <VisitorCount />
      </div>

      {/* 댓글 토글 버튼 */}
      <div className="mb-6">
        <button
          className="w-full max-w-xs px-4 py-3 bg-[color:var(--primary)] text-white rounded-[8px] hover:bg-[color:var(--button-hover)] transition text-base font-semibold"
          onClick={() => setShowComments(!showComments)}
        >
          {showComments ? '댓글 숨기기' : '💬 댓글 보기'}
        </button>
      </div>

      {/* 댓글 영역 */}
      {showComments && (
        <div className="w-full flex flex-col items-center">
          <CommentSection isAdmin={isAdmin} />
        </div>
      )}
    </main>
  );
}