'use client';

import { JOURNEY_ITEMS, type JourneyItem } from './journey.data';
import PhotoSlot from './PhotoSlot';

function Caption({ item }: { item: JourneyItem }) {
  return (
    <>
      <p
        className="text-[0.65rem] tracking-[0.25em] uppercase mb-2"
        style={{ color: 'var(--muted)' }}
      >
        {item.period || '시기 미정'}
      </p>
      <h2
        className="text-2xl sm:text-3xl font-bold leading-tight"
        style={{ color: 'var(--foreground)' }}
      >
        {item.label}
      </h2>
      {item.caption && (
        <p
          className="mt-3 text-sm leading-relaxed pl-3"
          style={{
            color: 'var(--muted)',
            borderLeft: '2px solid var(--accent)',
          }}
        >
          {item.caption}
        </p>
      )}
    </>
  );
}

function Entry({ item, index }: { item: JourneyItem; index: number }) {
  switch (item.variant) {
    case 'offset-left':
      return (
        <article className="grid grid-cols-12 gap-4 sm:gap-6 items-end">
          <div className="col-span-6 sm:col-span-5">
            <PhotoSlot
              index={index}
              photo={item.photo}
              aspect={item.aspect}
              alt={item.label}
            />
          </div>
          <div className="col-span-6 sm:col-span-6 sm:col-start-8 pb-2">
            <Caption item={item} />
          </div>
        </article>
      );

    case 'split-right':
      return (
        <article className="grid grid-cols-12 gap-4 sm:gap-10 items-center">
          <div className="col-span-7 sm:col-span-6 order-2 sm:order-1">
            <Caption item={item} />
          </div>
          <div className="col-span-5 sm:col-span-5 sm:col-start-8 order-1 sm:order-2">
            <PhotoSlot
              index={index}
              photo={item.photo}
              aspect={item.aspect}
              alt={item.label}
            />
          </div>
        </article>
      );

    case 'full-bleed':
      return (
        <article className="space-y-4">
          <div className="-mx-4 sm:-mx-10">
            <PhotoSlot
              index={index}
              photo={item.photo}
              aspect={item.aspect}
              alt={item.label}
            />
          </div>
          <div className="max-w-md">
            <Caption item={item} />
          </div>
        </article>
      );

    case 'split-left':
      return (
        <article className="grid grid-cols-12 gap-4 sm:gap-10 items-start">
          <div className="col-span-7 sm:col-span-6">
            <PhotoSlot
              index={index}
              photo={item.photo}
              aspect={item.aspect}
              alt={item.label}
            />
          </div>
          <div className="col-span-5 sm:col-span-5 sm:col-start-8 pt-6">
            <Caption item={item} />
          </div>
        </article>
      );

    case 'stacked':
      return (
        <article className="mx-auto max-w-sm text-center sm:text-left">
          <div className="mb-5">
            <PhotoSlot
              index={index}
              photo={item.photo}
              aspect={item.aspect}
              alt={item.label}
            />
          </div>
          <Caption item={item} />
        </article>
      );

    case 'portrait-right':
      return (
        <article className="grid grid-cols-12 gap-4 sm:gap-10 items-center">
          <div className="col-span-7 sm:col-span-7 sm:pr-6">
            <Caption item={item} />
            <p
              className="mt-6 text-xs"
              style={{ color: 'var(--muted)' }}
            >
              / 가장 최근 모습
            </p>
          </div>
          <div className="col-span-5 sm:col-span-4 sm:col-start-9">
            <PhotoSlot
              index={index}
              photo={item.photo}
              aspect={item.aspect}
              alt={item.label}
            />
          </div>
        </article>
      );

    default:
      return null;
  }
}

export default function JourneyGallery() {
  return (
    <div className="space-y-24 sm:space-y-32">
      {JOURNEY_ITEMS.map((item, i) => (
        <Entry key={item.id} item={item} index={i} />
      ))}
    </div>
  );
}
