'use client';

import { useRef } from 'react';

const SWIPE_THRESHOLD = 60;

type UseCardFlipProps = {
  flipped: boolean;
  setFlipped: (f: boolean) => void;
  innerRef: React.RefObject<HTMLDivElement| null>;
};

export default function useCardFlip({ flipped, setFlipped, innerRef }: UseCardFlipProps) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const dragging = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    const container = innerRef.current?.parentElement;
    if (!container) return;
    const { left, width } = container.getBoundingClientRect();
    const x = e.clientX - left;
    const edgeW = width * 0.2;
    if (x > edgeW && x < width - edgeW) return;

    startX.current = e.clientX;
    startY.current = e.clientY;
    dragging.current = true;
    if (innerRef.current) innerRef.current.style.transition = 'none';
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (
      !dragging.current ||
      startX.current === null ||
      startY.current === null ||
      !innerRef.current
    ) return;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    // 좌우 스와이프가 아닐 경우 무시
    if (Math.abs(dx) <= Math.abs(dy)) return;

    // 항상 같은 방향(오른쪽: 0→180, 왼쪽: 180→0)
    let angle = 0;
    if (!flipped) {
      // 일반인 → 개발자 (오른쪽 스와이프)
      angle = Math.max(0, Math.min(180, (dx / SWIPE_THRESHOLD) * 90));
    } else {
      // 개발자 → 일반인 (왼쪽 스와이프)
      angle = Math.max(0, Math.min(180, 180 + (dx / SWIPE_THRESHOLD) * 90));
    }
    innerRef.current.style.transform = `rotateY(${angle}deg)`;
  };

  const handlePointerEnd = (e: React.PointerEvent) => {
    if (!innerRef.current || startX.current === null) {
      dragging.current = false;
      startX.current = null;
      startY.current = null;
      return;
    }

    const dx = e.clientX - startX.current;
    const dy = e.clientY - (startY.current ?? 0);

    let nextFlipped = flipped;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
      if (!flipped && dx > 0) nextFlipped = true; // 오른쪽 스와이프 → 개발자
      if (flipped && dx < 0) nextFlipped = false; // 왼쪽 스와이프 → 일반인
    }

    setFlipped(nextFlipped);

    innerRef.current.style.transition = 'transform 0.3s ease';
    innerRef.current.style.transform = nextFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';

    dragging.current = false;
    startX.current = null;
    startY.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerEnd,
    onPointerCancel: handlePointerEnd,
  };
}