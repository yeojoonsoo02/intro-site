'use client';

import { useState } from 'react';
import CommentSection from '@/features/comments/CommentSection';
import VisitorCount from '@/features/visitors/VisitorCount';
import FlippableProfileCard from '@/features/profile/FlippableProfileCard';
import AuthButton from '@/features/auth/AuthButton';

export default function Home() {
  const [showComments, setShowComments] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [angle, setAngle] = useState(0);

  return (
    <main className="max-w-xl mx-auto p-6 text-center pb-24">
      {/* 설정 버튼은 각도 1000도 이상일 때만 표시 */}
      {angle >= 1000 && <AuthButton onAdminChange={setIsAdmin} visible />}
      <FlippableProfileCard isAdmin={isAdmin} onAngleChange={setAngle} />
      <div className="my-8">
        <VisitorCount />
      </div>
      {/* 댓글 버튼/영역도 각도 1000도 이상일 때만 표시 */}
      {angle >= 1000 && (
        <>
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
              </h2>
              <CommentSection isAdmin={isAdmin} />
            </div>
          )}
        </>
      )}
    </main>
  );
}