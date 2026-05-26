import type { JourneyItem } from '../journey.data';
import RevealOnScroll from '../RevealOnScroll';
import { Caption, Era, Heading, Photo, Reflection } from '../primitives';

export default function WideCinematic({ item }: { item: JourneyItem }): JSX.Element {
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
        {item.reflection && <Reflection>{item.reflection}</Reflection>}
      </RevealOnScroll>
    </section>
  );
}
