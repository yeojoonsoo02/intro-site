'use client';

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Profile } from './profile.model';
import ProfileCardContent from './ProfileCardContent';
import useCardFlip from './useCardFlip';

// 홈의 회전 프로필 카드. 앞면은 본인 프로필, 뒷면은 챗코가 개발자 프로필.
// 데이터는 서버(homeData)에서 받아 첫 HTML에 그대로 들어간다 — 브라우저가 따로 fetch하지 않는다.
export default function FlippableProfileCard({ profile, devProfile }: { profile: Profile; devProfile: Profile }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  // 카드 뒤집기는 가장자리 좌우 스와이프(pointer) 또는 카드에 포커스한 뒤 좌우 화살표 키.
  // isFlipped는 컨테이너 높이 계산과, 안 보이는 면을 조작 대상에서 빼는 데 쓴다.
  const { isFlipped, flip, ...pointerHandlers } = useCardFlip({ innerRef });

  // 안 보이는 면의 링크는 화면에 없는데도 Tab으로 포커스되고 스크린리더에 읽혔다.
  // inert로 그 면을 통째로 조작·읽기 대상에서 뺀다.
  useEffect(() => {
    if (frontRef.current) frontRef.current.inert = isFlipped;
    if (backRef.current) backRef.current.inert = !isFlipped;
  }, [isFlipped]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>): void => {
    // 카드 자체에 포커스가 있을 때만 — 안쪽 링크에서의 키 입력은 건드리지 않는다.
    if (e.target !== e.currentTarget) return;
    if (e.key === 'ArrowRight') flip(1);
    else if (e.key === 'ArrowLeft') flip(-1);
    else return;
    e.preventDefault();
  };

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
  }, [isFlipped]);

  return (
    <section
      className="max-w-[600px] mx-auto mt-4 sm:mt-8 md:mt-10 mb-4 sm:mb-8 px-3 sm:px-4 relative select-none z-10 transition-[height] duration-300 ease-out"
      style={{ perspective: 1200, overflow: 'visible', touchAction: 'pan-y' }}
      {...pointerHandlers}
      ref={containerRef}
      tabIndex={0}
      aria-label={t('flipCardHint')}
      onKeyDown={handleKeyDown}
    >
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
          <ProfileCardContent profile={profile} isDev={false} />
        </div>

        <div
          className="w-full absolute top-0 left-0"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          ref={backRef}
        >
          <ProfileCardContent profile={devProfile} isDev />
        </div>
      </div>
    </section>
  );
}
