'use client';

import { useTranslation } from 'react-i18next';
import SocialLinks from '@/features/social/SocialLinks';
import useInView from './useInView';

export default function ContactSection() {
  const { t } = useTranslation();
  const { ref, inView } = useInView();

  return (
    <div
      id="contact"
      ref={ref}
      role="region"
      aria-label="contact"
      className="mb-12 scroll-mt-24 transition-all duration-700"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
      }}
    >
      <h2
        className="text-sm font-bold tracking-wide mb-4"
        style={{ color: 'var(--muted)' }}
      >
        {t('contact')}
      </h2>
      <div className="flex flex-col gap-3">
        <a
          href="mailto:yeojoonsoo02@gmail.com"
          className="text-sm transition-opacity hover:opacity-70 inline-flex items-center gap-2"
          style={{ color: 'var(--foreground)' }}
        >
          <svg width="16" height="16" fill="none" aria-hidden="true" className="shrink-0">
            <path d="M1.5 3.5A2 2 0 0 1 3.5 1.5h9A2 2 0 0 1 14.5 3.5v9a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-9Zm1.5.4 3.2 2.8a.8.8 0 0 0 1 0L10.5 3.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          yeojoonsoo02@gmail.com
        </a>
        <div className="flex justify-start">
          <SocialLinks colored isDev={false} />
        </div>
      </div>
    </div>
  );
}
