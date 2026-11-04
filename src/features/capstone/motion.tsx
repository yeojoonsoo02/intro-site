'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

// 첫 화면 연출의 스위치 두 개. 둘 다 서버 HTML에는 최종 모습을 그린다(JS가 없거나 늦어도 내용이 다 보인다).
// 동작 줄이기 설정이면 아무것도 하지 않아 최종 모습 그대로다.

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function reducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return true;
  }
}

/** 화면에 처음 들어올 때 한 번 실행한다. IntersectionObserver가 없으면 바로 실행한다. */
function onFirstView(el: Element, run: () => void, threshold = 0.35): () => void {
  if (typeof IntersectionObserver === 'undefined') {
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

interface MotionScopeProps {
  className?: string;
  children: React.ReactNode;
}

/** 안쪽 연출(capstone.css의 [data-motion])을 화면에 들어올 때 한 번 튼다. */
export function MotionScope({ className, children }: MotionScopeProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    el.dataset.motion = 'ready';
    return onFirstView(el, () => {
      el.dataset.motion = 'play';
    });
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

interface CountUpProps {
  /** 최종 값 */
  to: number;
  /** 시작 값(기본 0). 줄어드는 숫자면 더 큰 값을 준다 */
  from?: number;
  decimals?: number;
  /** 천 단위 쉼표 */
  grouping?: boolean;
  /** 시작 지연(ms) */
  delay?: number;
  duration?: number;
}

function format(v: number, decimals: number, grouping: boolean): string {
  return v.toLocaleString('ko-KR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: grouping });
}

/** 숫자가 화면에 들어올 때 한 번 세어 올라간다. 폭은 최종 값 기준으로 잡아 둬서 글자가 밀리지 않는다. */
export function CountUp({ to, from = 0, decimals = 0, grouping = true, delay = 0, duration = 600 }: CountUpProps): JSX.Element {
  const ref = useRef<HTMLSpanElement>(null);
  const final = format(to, decimals, grouping);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    el.style.minWidth = `${el.getBoundingClientRect().width}px`;
    el.textContent = format(from, decimals, grouping);
    let raf = 0;
    let timer = 0;
    const stop = onFirstView(el, () => {
      timer = window.setTimeout(() => {
        const t0 = performance.now();
        const tick = (now: number): void => {
          const k = Math.min(1, (now - t0) / duration);
          const eased = 1 - (1 - k) ** 3;
          el.textContent = format(from + (to - from) * eased, decimals, grouping);
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }, delay);
    });
    return () => {
      stop();
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      el.textContent = final;
    };
  }, [to, from, decimals, grouping, delay, duration, final]);
  return (
    <span ref={ref} className="inline-block" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {final}
    </span>
  );
}
