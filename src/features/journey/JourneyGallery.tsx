import Image from 'next/image';
import { JOURNEY_ITEMS, type JourneyItem } from './journey.data';
import RevealOnScroll from './RevealOnScroll';

function Era({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="block text-[0.65rem] uppercase tracking-[0.2em] mb-2"
      style={{ color: 'var(--muted)' }}
    >
      {children}
    </span>
  );
}

function Heading({
  children,
  size = 'md',
}: {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const cls =
    size === 'lg'
      ? 'text-xl sm:text-2xl'
      : size === 'sm'
      ? 'text-base sm:text-lg'
      : 'text-lg sm:text-xl';
  return (
    <h2
      className={`font-bold leading-tight tracking-tight ${cls}`}
      style={{ color: 'var(--foreground)' }}
    >
      {children}
    </h2>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mt-2 text-sm leading-relaxed"
      style={{ color: 'var(--muted)' }}
    >
      {children}
    </p>
  );
}

/** 사진 한 장 — group hover로 미세 줌, sizes 정확히 부여 */
function Photo({
  src,
  alt,
  aspect,
  sizes,
}: {
  src: string;
  alt: string;
  aspect: string;
  sizes: string;
}) {
  return (
    <figure
      className={`relative ${aspect} overflow-hidden group`}
      style={{ background: 'var(--border)' }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
    </figure>
  );
}

function DuoPortrait({ item }: { item: JourneyItem }) {
  return (
    <section className="grid grid-cols-12 gap-3 sm:gap-5">
      <RevealOnScroll variant="bloom" className="col-span-7">
        <Photo
          src={item.photos[0]}
          alt={item.alts[0]}
          aspect="aspect-[4/5]"
          sizes="(min-width: 768px) 420px, 60vw"
        />
      </RevealOnScroll>
      <div className="col-span-5 flex flex-col">
        <RevealOnScroll delay={120}>
          <Era>{item.era}</Era>
          <Heading>{item.label}</Heading>
          <Caption>{item.caption}</Caption>
        </RevealOnScroll>
        {item.photos[1] && (
          <RevealOnScroll variant="bloom" delay={220} className="mt-3">
            <Photo
              src={item.photos[1]}
              alt={item.alts[1] ?? item.alts[0]}
              aspect="aspect-[4/5]"
              sizes="(min-width: 768px) 220px, 40vw"
            />
          </RevealOnScroll>
        )}
      </div>
    </section>
  );
}

function WideCinematic({ item }: { item: JourneyItem }) {
  return (
    <section>
      <RevealOnScroll>
        <Era>{item.era}</Era>
        <Heading size="lg">{item.label}</Heading>
      </RevealOnScroll>
      <RevealOnScroll variant="bloom" delay={120} className="mt-3">
        <Photo
          src={item.photos[0]}
          alt={item.alts[0]}
          aspect="aspect-[16/9]"
          sizes="(min-width: 768px) 720px, 100vw"
        />
      </RevealOnScroll>
      <RevealOnScroll delay={240}>
        <Caption>{item.caption}</Caption>
      </RevealOnScroll>
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
    <RevealOnScroll
      variant="bloom"
      className={`col-span-6 ${align === 'right' ? 'sm:col-start-7' : ''}`}
    >
      <Photo
        src={item.photos[0]}
        alt={item.alts[0]}
        aspect="aspect-square"
        sizes="(min-width: 768px) 360px, 50vw"
      />
    </RevealOnScroll>
  );
  const text = (
    <RevealOnScroll
      delay={140}
      className={`col-span-6 flex flex-col justify-center ${
        align === 'right' ? 'sm:col-start-1 sm:row-start-1' : ''
      }`}
    >
      <Era>{item.era}</Era>
      <Heading>{item.label}</Heading>
      <Caption>{item.caption}</Caption>
    </RevealOnScroll>
  );
  return (
    <section className="grid grid-cols-12 gap-4 sm:gap-6 items-center">
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

function AgeDisplay({ item }: { item: JourneyItem }) {
  return (
    <section className="grid grid-cols-12 gap-4 items-end">
      <RevealOnScroll className="col-span-7">
        <Era>{item.era}</Era>
        <p
          className="font-bold leading-[0.85] tracking-tight text-7xl sm:text-8xl tabular-nums"
          style={{ color: 'var(--foreground)' }}
        >
          {item.ageDisplay}
          <span
            className="text-base sm:text-lg font-medium ml-2 align-top"
            style={{ color: 'var(--muted)' }}
          >
            세
          </span>
        </p>
        <p
          className="mt-2 text-base font-medium"
          style={{ color: 'var(--foreground)' }}
        >
          {item.label}
        </p>
        <Caption>{item.caption}</Caption>
      </RevealOnScroll>
      <RevealOnScroll variant="bloom" delay={140} className="col-span-5">
        <Photo
          src={item.photos[0]}
          alt={item.alts[0]}
          aspect="aspect-square"
          sizes="(min-width: 768px) 280px, 40vw"
        />
      </RevealOnScroll>
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
    case 'age-display':
      return <AgeDisplay item={item} />;
  }
}

export default function JourneyGallery() {
  return (
    <div className="space-y-12 sm:space-y-16">
      {JOURNEY_ITEMS.map((item, idx) => (
        <div key={item.id} className="relative">
          {idx > 0 && (
            <RevealOnScroll>
              <div
                aria-hidden="true"
                className="absolute -top-6 sm:-top-8 left-0 right-0 flex items-center gap-3"
              >
                <span
                  className="h-px flex-1"
                  style={{ background: 'var(--border)' }}
                />
                <span
                  className="text-[0.6rem] tabular-nums"
                  style={{ color: 'var(--muted)' }}
                >
                  {String(idx + 1).padStart(2, '0')} / {String(JOURNEY_ITEMS.length).padStart(2, '0')}
                </span>
              </div>
            </RevealOnScroll>
          )}
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
