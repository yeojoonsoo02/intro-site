'use client';

import { useRef } from 'react';

const SWIPE_THRESHOLD = 60;
const MAX_SWIPE_ANGLE = 45;
const FLIP_TRIGGER_ANGLE = 30;

type UseCardFlipProps = {
  innerRef: React.RefObject<HTMLDivElement | null>;
};

export default function useCardFlip({ innerRef }: UseCardFlipProps) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const dragging = useRef(false);
  const currentAngle = useRef(0);
  const previewAngle = useRef(0); // 임시 회전 각도 저장

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

    // 스와이프 각도 제한
    const rawAngle = (dx / SWIPE_THRESHOLD) * MAX_SWIPE_ANGLE;
    previewAngle.current = Math.max(-MAX_SWIPE_ANGLE, Math.min(MAX_SWIPE_ANGLE, rawAngle));

    innerRef.current.style.transform = `rotateY(${currentAngle.current + previewAngle.current}deg)`;
  };

  const handlePointerEnd = (e: React.PointerEvent) => {
    if (!dragging.current || !innerRef.current) return;

    const absPreview = Math.abs(previewAngle.current);
    const shouldFlip = absPreview >= FLIP_TRIGGER_ANGLE;

    if (shouldFlip) {
      // 스와이프 방향에 따라 +180 또는 -180 추가
      const direction = previewAngle.current > 0 ? 1 : -1;
      currentAngle.current += 180 * direction;
    }

    // 최종 각도 적용
    innerRef.current.style.transition = 'transform 0.4s ease';
    innerRef.current.style.transform = `rotateY(${currentAngle.current}deg)`;

    // 초기화
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
  };
}