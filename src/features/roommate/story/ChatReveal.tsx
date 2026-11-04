'use client';

import { useEffect, useRef } from 'react';

// 장면의 말풍선 목록을 감싼다. 서버 HTML은 최종 모습(말풍선이 다 보임)이고,
// 목록이 화면에 처음 들어오는 순간에만 data-play를 달아 "입력 중 점 → 말풍선" 연출을 한 번 튼다(story.module.css).
// 이미 지나간 곳·아직 안 본 곳·JS 없음·동작 줄이기 설정이면 최종 모습 그대로다 — 전체 페이지 캡처에서도 다 보인다.

interface ChatRevealProps {
  className: string;
  label: string;
  children: React.ReactNode;
}

export default function ChatReveal({ className, label, children }: ChatRevealProps): JSX.Element {
  const ref = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    } catch {
      return;
    }
    // 처음부터 화면 안에 있으면(예: 새로고침 위치) 연출하지 않는다 — 이미 읽고 있던 글이 사라졌다 나타나지 않게.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          el.dataset.play = '';
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <ol ref={ref} className={className} aria-label={label}>
      {children}
    </ol>
  );
}
