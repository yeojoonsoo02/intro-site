'use client';

import type { PersonalInfoItem } from './portfolio.model';
import useInView from './useInView';

export default function PersonalInfoCard({ items }: { items: PersonalInfoItem[] }) {
  const { ref, inView } = useInView();

  if (items.length === 0) return null;

  return (
    <div
      ref={ref}
      className="mb-14 sm:mb-16 scroll-mt-24 transition-all duration-700"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
      }}
    >
      <div
        className="grid grid-cols-2 sm:grid-cols-3 gap-px rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--border)' }}
      >
        {items.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className="px-4 py-3.5"
            style={{ background: 'var(--card-bg)' }}
          >
            <div className="text-[0.65rem] font-medium tracking-wide uppercase mb-1" style={{ color: 'var(--muted)' }}>
              {item.label}
            </div>
            <div className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
