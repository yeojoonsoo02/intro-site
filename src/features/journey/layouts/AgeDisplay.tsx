import type { JourneyItem } from '../journey.data';
import RevealOnScroll from '../RevealOnScroll';
import { Caption, Era, Photo, Reflection } from '../primitives';

export default function AgeDisplay({ item }: { item: JourneyItem }): JSX.Element {
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
        <p className="mt-2 text-base font-medium" style={{ color: 'var(--foreground)' }}>
          {item.label}
        </p>
        <Caption>{item.caption}</Caption>
        {item.reflection && <Reflection>{item.reflection}</Reflection>}
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
