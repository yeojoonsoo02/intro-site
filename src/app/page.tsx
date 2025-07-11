'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import CommentSection from '@/features/comments/CommentSection';
import VisitorCount from '@/features/visitors/VisitorCount';
import FlippableProfileCard from '@/features/profile/FlippableProfileCard';
import AuthButton from '@/features/auth/AuthButton';
import FeedbackBanner from '@/features/feedback/FeedbackBanner';

export const dynamic = "force-dynamic";

export default function Home() {
  const [showComments, setShowComments] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [angle, setAngle] = useState(0);
  const [chatTrigger, setChatTrigger] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const handler = () => setChatTrigger((n) => n + 1);
    window.addEventListener('ai-chat', handler);
    return () => window.removeEventListener('ai-chat', handler);
  }, []);

  return (
    <>
      <main className="max-w-xl mx-auto p-6 text-center pb-32">
        {/* Top actions removed in favor of global menu */}
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
          {showComments ? t('hideComments') : t('showComments')}
        </button>
      </div>

      {/* 댓글 영역 */}
      {showComments && (
        <div id="comments" className="w-full flex flex-col items-center">
          <CommentSection isAdmin={isAdmin} />
        </div>
      )}
    </main>
    <FeedbackBanner
      onShowComments={() => setShowComments(true)}
      trigger={chatTrigger}
    />
    </>
  );}