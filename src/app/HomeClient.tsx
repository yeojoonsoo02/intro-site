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
      <div className="mt-6 flex justify-center">
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
      </div>

      <div className="pb-4 sm:pb-8 mt-8">
        <VisitorCount />
      </div>
    </main>
  );
}
