'use client';

import { JOURNEY_ITEMS, type JourneyItem } from './journey.data';
import PhotoSlot from './PhotoSlot';

function JourneyCard({ item, index }: { item: JourneyItem; index: number }) {
  return (
    <article
      className="card flex flex-col gap-4 p-5 sm:p-6"
      style={{ border: '1px solid var(--border)' }}
    >
      <PhotoSlot index={index} photo={item.photo} alt={item.label} />

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <h2
            className="text-lg sm:text-xl font-bold leading-tight"
            style={{ color: 'var(--foreground)' }}
          >
            {item.label}
          </h2>
          {item.period && (
            <span
              className="text-xs shrink-0"
              style={{ color: 'var(--muted)' }}
            >
              {item.period}
            </span>
          )}
        </div>

        <p
          className="text-sm leading-relaxed"
          style={{ color: item.caption ? 'var(--foreground)' : 'var(--muted)' }}
        >
          {item.caption || '사진과 설명을 곧 채울 예정입니다.'}
        </p>
      </div>
    </article>
  );
}

export default function JourneyGallery() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
      {JOURNEY_ITEMS.map((item, i) => (
        <JourneyCard key={item.id} item={item} index={i} />
      ))}
    </div>
  );
}
