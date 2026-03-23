'use client';

import { useTranslation } from 'react-i18next';
import SocialLinks from '@/features/social/SocialLinks';

export default function ContactSection() {
  const { t } = useTranslation();

  return (
    <section className="mb-12">
      <h2
        className="text-sm font-bold tracking-wide mb-4"
        style={{ color: 'var(--muted)' }}
      >
        {t('contact')}
      </h2>
      <div className="flex items-center gap-3 flex-wrap">
        <a
          href="mailto:yeojoonsoo02@gmail.com"
          className="text-sm transition-opacity hover:opacity-70"
          style={{ color: 'var(--foreground)' }}
        >
          yeojoonsoo02@gmail.com
        </a>
      </div>
      <SocialLinks colored isDev={false} />
    </section>
  );
}
