import type { JourneyItem } from '../journey.data';
import RevealOnScroll from '../RevealOnScroll';
import { Caption, Era, Heading, Photo, Reflection } from '../primitives';

interface SidePhotoProps {
  item: JourneyItem;
  align: 'left' | 'right';
}

export default function SidePhoto({ item, align }: SidePhotoProps): JSX.Element {
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
      {item.reflection && <Reflection>{item.reflection}</Reflection>}
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
