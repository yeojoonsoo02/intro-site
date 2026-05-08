'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import VisitorCount from '@/features/visitors/VisitorCount';
import FlippableProfileCard from '@/features/profile/FlippableProfileCard';

export default function HomeClient() {
  const { t } = useTranslation();

  return (
    <main className="max-w-xl mx-auto p-4 sm:p-6 text-center sm:min-h-[calc(100dvh-3.5rem)] sm:flex sm:flex-col">
      <div className="sm:flex-1 sm:flex sm:flex-col sm:justify-center">
        <FlippableProfileCard />
      </div>

      <nav
        aria-label={t('about')}
        className="mt-6 mb-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs"
        style={{ color: 'var(--muted)' }}
      >
        <Link href="/about" className="underline-offset-4 hover:underline">
          {t('about')}
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/journey" className="underline-offset-4 hover:underline">
          {t('journey')}
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/portfolio" className="underline-offset-4 hover:underline">
          {t('portfolio')}
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/blog" className="underline-offset-4 hover:underline">
          {t('blog')}
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/faq" className="underline-offset-4 hover:underline">
          {t('faq')}
        </Link>
      </nav>

      <div className="pb-4 sm:pb-8">
        <VisitorCount />
      </div>
    </main>
  );
}
