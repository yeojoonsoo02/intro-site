'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import VisitorCount from '@/features/visitors/VisitorCount';
import FlippableProfileCard from '@/features/profile/FlippableProfileCard';

export default function HomeClient() {
  const { t, i18n } = useTranslation();
  // 로케일 랜딩에서 눌러도 한국어 소개로 가던 문제 — 언어에 맞는 경로로 보낸다.
  const lang = (i18n.language || 'ko').split('-')[0];
  const aboutHref = lang === 'ko' ? '/about' : `/${lang}/about`;

  return (
    <main className="max-w-xl mx-auto p-4 sm:p-6 text-center sm:min-h-[calc(100dvh-3.5rem)] sm:flex sm:flex-col">
      <div className="sm:flex-1 sm:flex sm:flex-col sm:justify-center">
        <FlippableProfileCard />
      </div>

      {/* 이 사이트의 대표 기능은 AI 대화인데 진입점이 10초 뒤 뜨는 배너와 메뉴 안뿐이라
          발견되지 않았다. 첫 화면에 상시 노출되는 진입점을 둔다. */}
      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('open-prompt'))}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium shadow-sm transition-transform hover:scale-[1.03] active:scale-95"
          style={{ background: 'var(--primary)', color: 'var(--primary-contrast)' }}
        >
          {/* 이모지 대신 인라인 SVG — 사이트의 절제된 아이콘 톤에 맞춘다 */}
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M14 9.5a2 2 0 0 1-2 2H6l-3.5 2.5v-2.5a2 2 0 0 1-1-1.7V4.5a2 2 0 0 1 2-2h8.5a2 2 0 0 1 2 2z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
          {/* 번역은 클라이언트에서 로드되므로 defaultValue가 없으면 첫 페인트에
              'chatInvite' 키가 그대로 보인다(readMore와 같은 패턴). */}
          {t('chatInvite', { defaultValue: 'AI 준수와 대화하기' })}
        </button>
      </div>

      {/* Secondary CTA — 더 알고 싶은 사람을 About 페이지로 자연스럽게 유도 */}
      <div className="mt-3 flex justify-center">
        <Link
          href={aboutHref}
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
