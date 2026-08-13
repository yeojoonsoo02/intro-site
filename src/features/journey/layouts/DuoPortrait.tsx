import type { JourneyItem } from '../journey.data';
import RevealOnScroll from '../RevealOnScroll';
import { Caption, Era, Heading, Photo, Reflection } from '../primitives';

export default function DuoPortrait({ item }: { item: JourneyItem }): JSX.Element {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-5">
      <RevealOnScroll variant="bloom" className="col-span-1 sm:col-span-7">
        <Photo
          src={item.photos[0]}
          alt={item.alts[0]}
          aspect="aspect-[4/5]"
          sizes="(min-width: 768px) 420px, (min-width: 640px) 60vw, 100vw"
        />
      </RevealOnScroll>
      <div className="col-span-1 sm:col-span-5 flex flex-col">
        <RevealOnScroll delay={120}>
          <Era>{item.era}</Era>
          <Heading>{item.label}</Heading>
          <Caption>{item.caption}</Caption>
          {item.reflection && <Reflection>{item.reflection}</Reflection>}
        </RevealOnScroll>
        {item.photos[1] && (
          <RevealOnScroll variant="bloom" delay={220} className="mt-3">
            <Photo
              src={item.photos[1]}
              alt={item.alts[1] ?? item.alts[0]}
              aspect="aspect-[4/5]"
              sizes="(min-width: 768px) 220px, (min-width: 640px) 40vw, 100vw"
            />
          </RevealOnScroll>
        )}
      </div>
    </section>
  );
}
