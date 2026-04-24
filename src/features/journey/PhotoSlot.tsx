'use client';

import Image from 'next/image';

interface PhotoSlotProps {
  index: number;
  photo: string | null;
  alt: string;
}

export default function PhotoSlot({ index, photo, alt }: PhotoSlotProps) {
  if (photo) {
    return (
      <div
        className="relative w-full aspect-[4/3] overflow-hidden rounded-xl"
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
      className="relative w-full aspect-[4/3] rounded-xl flex flex-col items-center justify-center select-none"
      style={{
        background: 'var(--background)',
        border: '1px dashed var(--input-border)',
        color: 'var(--muted)',
      }}
      aria-label={`${alt} 사진 자리`}
      role="img"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span className="mt-2 text-xs">사진 {String(index + 1).padStart(2, '0')}</span>
    </div>
  );
}
