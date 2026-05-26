import { JOURNEY_ITEMS, type JourneyItem } from './journey.data';
import RevealOnScroll from './RevealOnScroll';
import DuoPortrait from './layouts/DuoPortrait';
import WideCinematic from './layouts/WideCinematic';
import SidePhoto from './layouts/SidePhoto';
import AgeDisplay from './layouts/AgeDisplay';

function renderItem(item: JourneyItem): JSX.Element | null {
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
    default:
      return null;
  }
}

export default function JourneyGallery(): JSX.Element {
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
                <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
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
