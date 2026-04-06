'use client';

import { useTranslation } from 'react-i18next';
import type { Testimonial } from './portfolio.model';
import useInView from './useInView';

export default function TestimonialsSection({ items }: { items: Testimonial[] }) {
  const { t } = useTranslation();
  const { ref, inView } = useInView();

  if (items.length === 0) return null;

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <div
      id="testimonials"
      ref={ref}
      role="region"
      aria-label="testimonials"
      className="mb-14 sm:mb-16 scroll-mt-24 transition-all duration-700"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
      }}
    >
      <h2
        className="text-sm font-bold tracking-wide mb-6"
        style={{ color: 'var(--muted)' }}
      >
        {t('testimonials')}
      </h2>
      <div className="space-y-4">
        {sorted.map((item) => (
          <blockquote
            key={item.id}
            className="pl-4 py-3"
            style={{ borderLeft: '3px solid var(--accent)' }}
          >
            <p
              className="text-sm leading-relaxed mb-2 break-keep"
              style={{ color: 'var(--foreground)' }}
            >
              &ldquo;{item.content}&rdquo;
            </p>
            <footer className="flex items-center gap-2">
              <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>
                {item.name}
              </span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {item.role}
              </span>
            </footer>
          </blockquote>
        ))}
      </div>
    </div>
  );
}
