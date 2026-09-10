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
          className="text-[16px] underline underline-offset-4 self-start"
          style={{ color: 'var(--accent)' }}
        >
          yeojoonsoo02@gmail.com
        </a>
        <div className="flex justify-start">
          <SocialLinks colored />
        </div>
      </div>
    </SectionWrapper>
  );
}
