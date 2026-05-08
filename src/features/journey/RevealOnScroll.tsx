'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  children: React.ReactNode;
  /** 시기 카드 사이 차등 진입 (0~150ms 권장) */
  delay?: number;
  /** 사진은 더 큰 진입 동작이 어울려서 변형 적용 */
  variant?: 'soft' | 'bloom';
  className?: string;
}

/**
 * Intersection Observer 기반 스크롤 진입 애니메이션 래퍼.
 * 한 번 보이면 disconnect — 스크롤 다시 위로 가도 깜빡이지 않음.
 * prefers-reduced-motion 사용자에게는 즉시 표시 (transition만 0).
 */
export default function RevealOnScroll({
  children,
  delay = 0,
  variant = 'soft',
  className = '',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const initial =
    variant === 'bloom'
      ? 'opacity-0 translate-y-4 scale-[0.97] blur-[6px]'
      : 'opacity-0 translate-y-3';
  const settled =
    'opacity-100 translate-y-0 scale-100 blur-0';

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={[
        'transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
        'motion-reduce:transition-none motion-reduce:transform-none',
        visible ? settled : initial,
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
