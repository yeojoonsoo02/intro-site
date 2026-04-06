'use client';

import { useTranslation } from 'react-i18next';
import type { Certification } from './portfolio.model';
import useInView from './useInView';

export default function CertificationsSection({ items }: { items: Certification[] }) {
  const { t } = useTranslation();
  const { ref, inView } = useInView();

  if (items.length === 0) return null;

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <div
      id="certifications"
      ref={ref}
      role="region"
      aria-label="certifications"
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
        {t('certifications')}
      </h2>
      <div className="space-y-3">
        {sorted.map((cert) => (
          <div
            key={cert.id}
            className="flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="mt-1 w-2 h-2 rounded-full shrink-0"
              style={{ background: 'var(--primary)' }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                  {cert.url ? (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-70 transition-opacity"
                    >
                      {cert.name}
                    </a>
                  ) : (
                    cert.name
                  )}
                </span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {cert.date}
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                {cert.issuer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
