'use client';

import { useRef } from 'react';

const SWIPE_THRESHOLD = 60;
const MAX_SWIPE_ANGLE = 45; // 최대 회전 각도 제한

type UseCardFlipProps = {
  flipped: boolean;
  setFlipped: (f: boolean) => void;
  innerRef: React.RefObject<HTMLDivElement | null>;
};

export default function useCardFlip({ flipped, setFlipped, innerRef }: UseCardFlipProps) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const dragging = useRef(false);
  const currentAngle = useRef<number>(0);

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
    currentAngle.current = flipped ? 180 : 0;

    if (innerRef.current) innerRef.current.style.transition = 'none';
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (
      !dragging.current ||
      startX.current === null ||
      startY.current === null ||
      !innerRef.current
    )
      return;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    if (Math.abs(dx) <= Math.abs(dy)) return;

    const delta = (dx / SWIPE_THRESHOLD) * MAX_SWIPE_ANGLE;
    const base = flipped ? 180 : 0;
    const angle = base + delta;

    currentAngle.current = angle;
    innerRef.current.style.transform = `rotateY(${angle}deg)`;
  };

  const handlePointerEnd = (e: React.PointerEvent) => {
    if (!innerRef.current) return;

    const rawAngle = currentAngle.current;
    const finalAngle = ((rawAngle % 360) + 360) % 360; // 0 ~ 359

    const distTo0 = Math.abs(finalAngle > 180 ? finalAngle - 360 : finalAngle);
    const distTo180 = Math.abs(finalAngle - 180);
    const targetAngle = distTo0 < distTo180 ? 0 : 180;

    setFlipped(targetAngle === 180);
    innerRef.current.style.transition = 'transform 0.4s ease';
    innerRef.current.style.transform = `rotateY(${targetAngle}deg)`;

    dragging.current = false;
    startX.current = null;
    startY.current = null;
    currentAngle.current = 0;
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerEnd,
    onPointerCancel: handlePointerEnd,
  };
}