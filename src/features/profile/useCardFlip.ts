'use client';

import { useRef } from 'react';

const SWIPE_THRESHOLD = 60;
const MAX_ANGLE = 45;

type UseCardFlipProps = {
  flipped: boolean;
  setFlipped: (f: boolean) => void;
  innerRef: React.RefObject<HTMLDivElement | null>;
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

    if (Math.abs(dx) <= Math.abs(dy)) return;

    const ratio = Math.min(1, Math.abs(dx) / SWIPE_THRESHOLD);
    const delta = ratio * MAX_ANGLE;

    const baseAngle = flipped ? 180 : 0;
    const angle = baseAngle + (dx > 0 ? delta : -delta);

    innerRef.current.style.transform = `rotateY(${angle}deg)`;
  };

  const handlePointerEnd = (e: React.PointerEvent) => {
    if (!innerRef.current || startX.current === null || startY.current === null) {
      dragging.current = false;
      startX.current = null;
      startY.current = null;
      return;
    }

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    const shouldFlip = Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD;
    const nextFlipped = shouldFlip ? !flipped : flipped;

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