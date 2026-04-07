'use client';

import { useTranslation } from 'react-i18next';
import SocialLinks from '@/features/social/SocialLinks';
import SectionWrapper from './SectionWrapper';

export default function ContactSection() {
  const { t } = useTranslation();
  return (
    <SectionWrapper id="contact" title={t('contact')} className="mb-12">
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
    </SectionWrapper>
  );
}
