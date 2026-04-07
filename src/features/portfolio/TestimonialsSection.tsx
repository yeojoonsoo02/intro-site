'use client';

import { useTranslation } from 'react-i18next';
import type { Testimonial } from './portfolio.model';
import SectionWrapper from './SectionWrapper';

export default function TestimonialsSection({ items }: { items: Testimonial[] }) {
  const { t } = useTranslation();
  if (items.length === 0) return null;

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <SectionWrapper id="testimonials" title={t('testimonials')}>
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
    </SectionWrapper>
  );
}
