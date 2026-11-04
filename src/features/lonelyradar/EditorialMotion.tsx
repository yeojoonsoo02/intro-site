'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

// 에디토리얼 페이지의 움직임 스위치 두 개. 서버 HTML은 언제나 최종 모습이다(JS가 없거나 늦어도 내용이 다 보이고,
// 전체 페이지 캡처에서도 0이나 꺼진 사다리로 찍히지 않는다). 화면에 처음 들어오는 순간에만 시작 모습으로 돌려 연출하고,
// 동작 줄이기 설정이면 아무것도 하지 않는다.

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function reducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return true;
  }
}

/** 화면에 처음 들어올 때 한 번 run. 이미 보이는 곳이면(또는 IntersectionObserver가 없으면) 바로 실행한다. */
function onFirstView(el: Element, run: () => void, threshold = 0.4): () => void {
  const r = el.getBoundingClientRect();
  if (typeof IntersectionObserver === 'undefined' || (r.top < window.innerHeight * 0.85 && r.bottom > 0)) {
    run();
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        run();
      }
    },
    { threshold },
  );
  io.observe(el);
  return () => io.disconnect();
}

interface PlayOnViewProps {
  as?: 'div' | 'ol' | 'section' | 'span';
  className?: string;
  children: React.ReactNode;
  threshold?: number;
}

/** 안쪽 연출(editorial.css의 [data-motion='play'])을 화면에 들어올 때 한 번 튼다. 키프레임이 fill-mode both라 시작 모습부터 그려진다. */
export function PlayOnView({ as = 'div', className, children, threshold }: PlayOnViewProps): JSX.Element {
  const ref = useRef<HTMLElement>(null);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    return onFirstView(
      el,
      () => {
        el.dataset.motion = 'play';
      },
      threshold,
    );
  }, [threshold]);
  const Tag = as;
  return (
    <Tag ref={ref as React.RefObject<never>} className={className}>
      {children}
    </Tag>
  );
}

interface FadeCountProps {
  to: number;
  decimals?: number;
  duration?: number;
}

function format(v: number, decimals: number): string {
  return v.toLocaleString('ko-KR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** 숫자가 화면에 들어올 때 천천히 떠오르며 세어 올라간다. 폭은 최종 값 기준으로 잡아 글자가 밀리지 않는다. */
export function FadeCount({ to, decimals = 0, duration = 1400 }: FadeCountProps): JSX.Element {
  const ref = useRef<HTMLSpanElement>(null);
  const final = format(to, decimals);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    let raf = 0;
    const stop = onFirstView(el, () => {
      el.style.minWidth = `${el.getBoundingClientRect().width}px`;
      el.style.opacity = '0';
      el.textContent = format(0, decimals);
      const t0 = performance.now();
      const tick = (now: number): void => {
        const k = Math.min(1, (now - t0) / duration);
        const eased = 1 - (1 - k) ** 3;
        el.style.opacity = String(Math.min(1, k * 2.2));
        el.textContent = format(to * eased, decimals);
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    return () => {
      stop();
      cancelAnimationFrame(raf);
      el.style.opacity = '';
      el.textContent = final;
    };
  }, [to, decimals, duration, final]);
  return (
    <span ref={ref} className="inline-block">
      {final}
    </span>
  );
}
