'use client';

import { useTranslation } from 'react-i18next';

export default function ResumeDownload() {
  const { t, i18n } = useTranslation();

  const handleDownload = (): void => {
    const lang = i18n.language || 'ko';
    window.open(`/api/resume?lang=${lang}`, '_blank');
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
      style={{
        background: 'color-mix(in srgb, var(--foreground) 8%, transparent)',
        color: 'var(--foreground)',
        border: '1px solid var(--border)',
      }}
    >
      <svg width="14" height="14" fill="none" viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M8 1v10m0 0L4.5 7.5M8 11l3.5-3.5M2 13.5h12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {t('downloadResume')}
    </button>
  );
}
