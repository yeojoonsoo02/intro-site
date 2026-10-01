'use client';

import { useRef, useState } from 'react';

const SWIPE_THRESHOLD = 60;
const MAX_SWIPE_ANGLE = 45;
const FLIP_TRIGGER_ANGLE = 30;

export type UseCardFlipProps = {
  innerRef: React.RefObject<HTMLDivElement | null>;
  onAngleChange?: (angle: number) => void;
};

export default function useCardFlip({ innerRef, onAngleChange }: UseCardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const dragging = useRef(false);
  const currentAngle = useRef(0);
  const previewAngle = useRef(0);

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
    previewAngle.current = 0;

    if (innerRef.current) innerRef.current.style.transition = 'none';
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || startX.current === null || !innerRef.current) return;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - (startY.current ?? 0);
    if (Math.abs(dx) <= Math.abs(dy)) return;

    const rawAngle = (dx / SWIPE_THRESHOLD) * MAX_SWIPE_ANGLE;
    previewAngle.current = Math.max(-MAX_SWIPE_ANGLE, Math.min(MAX_SWIPE_ANGLE, rawAngle));

    const totalAngle = currentAngle.current + previewAngle.current;
    innerRef.current.style.transform = `rotateY(${totalAngle}deg)`;
    onAngleChange?.(totalAngle);
  };

  // 현재 각도(currentAngle)로 카드를 부드럽게 돌려 놓는다.
  const settle = () => {
    if (!innerRef.current) return;
    innerRef.current.style.transition = 'transform 0.4s ease';
    innerRef.current.style.transform = `rotateY(${currentAngle.current}deg)`;
    onAngleChange?.(currentAngle.current);
  };

  /** 스와이프 없이 뒤집기 — 키보드 사용자용. direction은 도는 방향(1: 오른쪽, -1: 왼쪽). */
  const flip = (direction: 1 | -1) => {
    if (!innerRef.current) return;
    currentAngle.current += 180 * direction;
    setIsFlipped(currentAngle.current % 360 !== 0);
    settle();
  };

  const handlePointerEnd = (e: React.PointerEvent) => {
    if (!dragging.current || !innerRef.current) return;

    const absPreview = Math.abs(previewAngle.current);
    const shouldFlip = absPreview >= FLIP_TRIGGER_ANGLE;

    if (shouldFlip) {
      const direction = previewAngle.current > 0 ? 1 : -1;
      currentAngle.current += 180 * direction;
      setIsFlipped(currentAngle.current % 360 !== 0);
    }

    settle();

    dragging.current = false;
    startX.current = null;
    startY.current = null;
    previewAngle.current = 0;
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerEnd,
    onPointerCancel: handlePointerEnd,
    isFlipped,
    flip,
  };
}
