import Image from 'next/image';
import { JOURNEY_ITEMS, type JourneyItem } from './journey.data';

function Era({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="block text-[0.7rem] uppercase tracking-[0.25em] mb-3"
      style={{ color: 'var(--muted)' }}
    >
      {children}
    </span>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-bold leading-tight tracking-tight"
      style={{ color: 'var(--foreground)' }}
    >
      {children}
    </h2>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mt-4 text-sm sm:text-base leading-relaxed pl-4"
      style={{ color: 'var(--muted)', borderLeft: '2px solid var(--accent)' }}
    >
      {children}
    </p>
  );
}

function DuoPortrait({ item }: { item: JourneyItem }) {
  return (
    <section className="grid grid-cols-12 gap-4 sm:gap-6">
      <figure className="col-span-12 sm:col-span-7 relative aspect-[3/4] overflow-hidden rounded-md">
        <Image
          src={item.photos[0]}
          alt={item.alts[0]}
          fill
          sizes="(min-width: 640px) 60vw, 100vw"
          className="object-cover"
        />
      </figure>
      <div className="col-span-12 sm:col-span-5 flex flex-col">
        <Era>{item.era}</Era>
        <Heading>
          <span className="text-2xl sm:text-3xl">{item.label}</span>
        </Heading>
        <Caption>{item.caption}</Caption>
        {item.photos[1] && (
          <figure className="mt-5 relative aspect-[3/4] overflow-hidden rounded-md max-w-[220px]">
            <Image
              src={item.photos[1]}
              alt={item.alts[1] ?? item.alts[0]}
              fill
              sizes="220px"
              className="object-cover"
            />
          </figure>
        )}
      </div>
    </section>
  );
}

function WideCinematic({ item }: { item: JourneyItem }) {
  return (
    <section>
      <Era>{item.era}</Era>
      <Heading>
        <span className="text-3xl sm:text-5xl">{item.label}</span>
      </Heading>
      <figure className="mt-6 relative aspect-[16/10] overflow-hidden rounded-md">
        <Image
          src={item.photos[0]}
          alt={item.alts[0]}
          fill
          sizes="(min-width: 768px) 80vw, 100vw"
          className="object-cover"
        />
      </figure>
      <Caption>{item.caption}</Caption>
    </section>
  );
}

function SidePhoto({
  item,
  align,
}: {
  item: JourneyItem;
  align: 'left' | 'right';
}) {
  const photo = (
    <figure
      className={`col-span-12 sm:col-span-6 relative aspect-[4/5] overflow-hidden rounded-md ${
        align === 'right' ? 'sm:col-start-7' : ''
      }`}
    >
      <Image
        src={item.photos[0]}
        alt={item.alts[0]}
        fill
        sizes="(min-width: 640px) 50vw, 100vw"
        className="object-cover"
      />
    </figure>
  );
  const text = (
    <div
      className={`col-span-12 sm:col-span-6 flex flex-col justify-center ${
        align === 'right' ? 'sm:col-start-1 sm:row-start-1' : ''
      }`}
    >
      <Era>{item.era}</Era>
      <Heading>
        <span className="text-2xl sm:text-4xl">{item.label}</span>
      </Heading>
      <Caption>{item.caption}</Caption>
    </div>
  );
  return (
    <section className="grid grid-cols-12 gap-4 sm:gap-8 items-center">
      {align === 'left' ? (
        <>
          {photo}
          {text}
        </>
      ) : (
        <>
          {text}
          {photo}
        </>
      )}
    </section>
  );
}

function BigNow({ item }: { item: JourneyItem }) {
  return (
    <section className="grid grid-cols-12 gap-6 items-end">
      <div className="col-span-12 sm:col-span-8">
        <Era>{item.era}</Era>
        <Heading>
          <span className="text-6xl sm:text-8xl">{item.label}</span>
        </Heading>
        <Caption>{item.caption}</Caption>
      </div>
      <figure className="col-span-12 sm:col-span-4 relative aspect-[4/5] overflow-hidden rounded-md">
        <Image
          src={item.photos[0]}
          alt={item.alts[0]}
          fill
          sizes="(min-width: 640px) 30vw, 100vw"
          className="object-cover"
        />
      </figure>
    </section>
  );
}

function renderItem(item: JourneyItem) {
  switch (item.layout) {
    case 'duo-portrait':
      return <DuoPortrait item={item} />;
    case 'wide-cinematic':
      return <WideCinematic item={item} />;
    case 'side-photo-left':
      return <SidePhoto item={item} align="left" />;
    case 'side-photo-right':
      return <SidePhoto item={item} align="right" />;
    case 'big-now':
      return <BigNow item={item} />;
  }
}

export default function JourneyGallery() {
  return (
    <div className="space-y-20 sm:space-y-28">
      {JOURNEY_ITEMS.map((item, idx) => (
        <div key={item.id} className="relative">
          {idx > 0 && (
            <div
              aria-hidden="true"
              className="absolute -top-10 sm:-top-14 left-0 right-0 flex items-center gap-3"
            >
              <span
                className="h-px flex-1"
                style={{ background: 'var(--border)' }}
              />
              <span
                className="text-[0.65rem] tabular-nums"
                style={{ color: 'var(--muted)' }}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>
            </div>
          )}
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
