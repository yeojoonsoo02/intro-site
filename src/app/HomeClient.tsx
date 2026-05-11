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

      {/* Primary CTA — 더 알고 싶은 사람을 About 페이지로 자연스럽게 유도 */}
      <div className="mt-7 flex flex-col items-center gap-3">
        <Link
          href="/about"
          className="group inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--foreground)' }}
        >
          <span>{t('readMore', { defaultValue: '더 알고 싶다면' })}</span>
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-200 group-hover:translate-x-1"
          >
            →
          </span>
          <span className="sr-only">{t('about')}</span>
        </Link>

        {/* Secondary nav — 부가 페이지는 작게 */}
        <nav
          aria-label={t('about')}
          className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[0.7rem]"
          style={{ color: 'var(--muted)' }}
        >
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
      </div>

      <div className="pb-4 sm:pb-8 mt-4">
        <VisitorCount />
      </div>
    </main>
  );
}
