'use client';

import Image from 'next/image';
import type { JourneyAspect } from './journey.data';

interface PhotoSlotProps {
  index: number;
  photo: string | null;
  aspect: JourneyAspect;
  alt: string;
  className?: string;
}

const ASPECT_CLASS: Record<JourneyAspect, string> = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
};

export default function PhotoSlot({
  index,
  photo,
  aspect,
  alt,
  className = '',
}: PhotoSlotProps) {
  const aspectClass = ASPECT_CLASS[aspect];

  if (photo) {
    return (
      <div
        className={`relative overflow-hidden ${aspectClass} ${className}`}
        style={{ background: 'var(--border)' }}
      >
        <Image
          src={photo}
          alt={alt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative ${aspectClass} ${className} flex flex-col items-center justify-center select-none`}
      style={{
        background:
          'repeating-linear-gradient(-45deg, color-mix(in srgb, var(--border) 60%, transparent) 0 1px, transparent 1px 14px)',
        border: '1px solid var(--border)',
        color: 'var(--muted)',
      }}
      aria-label={`${alt} 사진 자리`}
      role="img"
    >
      <span className="text-[0.6rem] tracking-[0.2em] uppercase">
        photo {String(index + 1).padStart(2, '0')}
      </span>
      <span className="mt-1 text-xs">{alt}</span>
    </div>
  );
}
