'use client';

import { useState, useEffect, useRef } from 'react';
import { Profile } from './profile.model';
import {
  fetchProfile,
  saveProfile,
  fetchDevProfile,
  saveDevProfile,
} from './profile.api';
import ProfileCardContent from './ProfileCardContent';
import ProfileEditForm from './ProfileEditForm';

// 스와이프 역치 및 최대 회전 각도
const SWIPE_THRESHOLD = 60;
const MAX_ANGLE = 45;

export default function FlippableProfileCard({ isAdmin = false }: { isAdmin?: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [devProfile, setDevProfile] = useState<Profile | null>(null);

  const startX = useRef<number | null>(null);
  const dragging = useRef(false);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProfile().then(setProfile);
    fetchDevProfile().then(setDevProfile);

    // 진입 힌트 애니메이션
    if (innerRef.current) {
      innerRef.current.animate(
        [
          { transform: 'rotateY(0deg)' },
          { transform: 'rotateY(15deg)' },
          { transform: 'rotateY(0deg)' },
        ],
        { duration: 800, easing: 'ease-in-out', delay: 500 }
      );
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    const container = innerRef.current?.parentElement;
    if (!container) return;
    const { left, width } = container.getBoundingClientRect();
    const x = e.clientX - left;
    const edgeW = width * 0.2;
    if (x > edgeW && x < width - edgeW) {
      // 중앙 영역은 무시
      return;
    }

    startX.current = e.clientX;
    dragging.current = true;
    if (innerRef.current) innerRef.current.style.transition = 'none';
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || startX.current === null || !innerRef.current) return;
    const dx = e.clientX - startX.current;
    const ratio = Math.min(1, Math.abs(dx) / SWIPE_THRESHOLD);
    const delta = ratio * MAX_ANGLE;
    let angle: number;
    if (!flipped) {
      angle = dx > 0 ? delta : -delta;
    } else {
      angle = 180 + (dx > 0 ? -delta : delta);
    }
    innerRef.current.style.transform = `rotateY(${angle}deg)`;
  };

  const handlePointerEnd = (e: React.PointerEvent) => {
    if (!innerRef.current || startX.current === null) {
      dragging.current = false;
      startX.current = null;
      return;
    }
    const dx = e.clientX - startX.current;
    const shouldFlip = Math.abs(dx) > SWIPE_THRESHOLD;
    const nextFlipped = shouldFlip ? !flipped : flipped;
    setFlipped(nextFlipped);

    // 스냅 애니메이션
    innerRef.current.style.transition = 'transform 0.3s ease';
    innerRef.current.style.transform = nextFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';

    dragging.current = false;
    startX.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  const handleProfileChange = async (next: Profile) => {
    setProfile(next);
    await saveProfile(next);
  };
  const handleDevProfileChange = async (next: Profile) => {
    setDevProfile(next);
    await saveDevProfile(next);
  };

  return (
    <section
      className="max-w-[600px] mx-auto mt-20 mb-8 px-2 relative select-none"
      style={{ perspective: 1200, overflow: 'visible', touchAction: 'pan-y' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <div className="absolute top-2 right-2 z-10 text-xs sm:text-sm font-semibold bg-[#232334] text-[#E4E4E7] px-3 py-1 rounded-full shadow pointer-events-none select-none">
        {flipped ? '개발자 프로필' : '일반인 프로필'}
      </div>

      <div className="relative w-full min-h-[480px]" style={{ perspective: 1200, overflow: 'visible' }}>
        <div
          ref={innerRef}
          className="w-full h-full"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            willChange: 'transform',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.5s cubic-bezier(.4,0,.2,1)',
          }}
        >
          {/* 앞면 */}
          <div
            className={`w-full h-full left-0 top-0 ${flipped ? 'absolute' : 'relative'}`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            {profile && (
              <>
                <ProfileCardContent profile={profile} isDev={false} />
                {isAdmin && (
                  <ProfileEditForm
                    profile={profile}
                    onChange={handleProfileChange}
                    label="관심사·취미"
                  />
                )}
              </>
            )}
          </div>
          {/* 뒷면 */}
          <div
            className={`w-full h-full left-0 top-0 ${flipped ? 'relative' : 'absolute'}`}
            style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
          >
            {devProfile && (
              <>
                <ProfileCardContent profile={devProfile} isDev />
                {isAdmin && (
                  <ProfileEditForm
                    profile={devProfile}
                    onChange={handleDevProfileChange}
                    label="주요 기술"
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
