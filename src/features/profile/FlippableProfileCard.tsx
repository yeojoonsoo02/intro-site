// FlippableProfileCard.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Profile } from './profile.model';
import { fetchProfile, fetchDevProfile } from './profile.api';
import { DEFAULT_PROFILES } from './defaultProfiles';
import { useTranslation } from 'react-i18next';
import ProfileCardContent from './ProfileCardContent';
import useCardFlip from './useCardFlip';

interface Props {
  onAngleChange?: (angle: number) => void;
}

export default function FlippableProfileCard({ onAngleChange }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [devProfile, setDevProfile] = useState<Profile | null>(null);
  const { i18n, t } = useTranslation();
  const innerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  // flip은 별도 버튼으로 분리하기 위해 pointer 핸들러와 떼어낸다
  const { isFlipped, flip, ...pointerHandlers } = useCardFlip({
    innerRef,
    onAngleChange,
  });

  useEffect(() => {
    // Fetch language-specific profiles
    const currentLang = i18n.language || 'en';
    // 언어 변경 시 이전 요청의 stale 응답이 최신 상태를 덮어쓰지 않도록 cancelled 플래그 사용
    let cancelled = false;
    fetchProfile(currentLang).then(p => {
      if (!cancelled) setProfile(p ?? DEFAULT_PROFILES[currentLang] ?? DEFAULT_PROFILES['en']);
    });
    fetchDevProfile(currentLang).then(p => {
      if (!cancelled) setDevProfile(p ?? DEFAULT_PROFILES[currentLang] ?? DEFAULT_PROFILES['en']);
    });
    return () => {
      cancelled = true;
    };
  }, [i18n.language]);

  // 마운트 시 1회만 흔들림 애니메이션 실행 (reduced-motion 사용자는 스킵)
  useEffect(() => {
    if (!innerRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    innerRef.current.animate(
      [
        { transform: 'rotateY(0deg)' },
        { transform: 'rotateY(15deg)' },
        { transform: 'rotateY(0deg)' },
      ],
      { duration: 800, easing: 'ease-in-out', delay: 500 }
    );
  }, []);

  // Adjust container height based on the currently visible face only,
  // so the shorter front face doesn't leave empty space below.
  useEffect(() => {
    const container = containerRef.current;
    const front = frontRef.current;
    const back = backRef.current;
    if (!container || !front || !back) return;

    const updateHeight = () => {
      const visible = isFlipped ? back : front;
      container.style.height = `${visible.offsetHeight}px`;
    };

    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(front);
    ro.observe(back);
    return () => {
      ro.disconnect();
    };
  }, [profile, devProfile, isFlipped]);

  return (
    <section
      className="max-w-[600px] mx-auto mt-4 sm:mt-8 md:mt-10 mb-4 sm:mb-8 px-3 sm:px-4 relative select-none z-10 transition-[height] duration-300 ease-out"
      style={{ perspective: 1200, overflow: 'visible', touchAction: 'pan-y' }}
      {...pointerHandlers}
      ref={containerRef}
    >
      {/* role=button 컨테이너 안에 mailto/소셜/chip 링크를 중첩하면 ARIA 위반이므로
          뒤집기 인터랙션을 명시적 버튼으로 분리. 네이티브 button이 Enter/Space 키보드 처리 */}
      <button
        type="button"
        onClick={flip}
        aria-pressed={isFlipped}
        aria-label={t('flipCard', { defaultValue: isFlipped ? '일반 프로필 보기' : '개발자 프로필 보기' })}
        className="absolute top-1 right-4 sm:right-6 z-20 rounded-full px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
        style={{
          background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
          color: 'var(--primary)',
          border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
        }}
      >
        ⇄
      </button>
      <div
        className="relative w-full"
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
        ref={innerRef}
      >
        <div
          className="w-full"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}
          ref={frontRef}
        >
          {profile && <ProfileCardContent profile={profile} isDev={false} />}
        </div>

        <div
          className="w-full absolute top-0 left-0"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          ref={backRef}
        >
          {devProfile && <ProfileCardContent profile={devProfile} isDev />}
        </div>
      </div>
    </section>
  );
}