'use client';
import { useEffect, useState } from 'react';
import i18n from '@/lib/i18n';
import { useTranslation } from 'next-i18next';
import { useRouter, usePathname } from 'next/navigation';

const LANGS = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
];

export default function LanguageSwitcher() {
  const [lang, setLang] = useState('en');
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Get language from URL or i18n
    const currentLang = pathname.split('/')[1];
    if (LANGS.some(l => l.code === currentLang)) {
      setLang(currentLang);
      if (i18n && i18n.language !== currentLang) {
        i18n.changeLanguage(currentLang);
      }
    } else if (i18n && i18n.language) {
      setLang(i18n.language);
    }
  }, [pathname]);

  const changeLang = (l: string) => {
    if (!i18n) return;
    i18n.changeLanguage(l);
    document.documentElement.lang = l;
    localStorage.setItem('lang', l);
    setLang(l);
    
    // Navigate to the new language route
    if (l === 'en') {
      router.push('/');
    } else {
      router.push(`/${l}`);
    }
  };

  return (
    <label className="flex items-center gap-1 text-sm">
      <span role="img" aria-label="language">🌐</span> {t('language')}
      <select
        value={lang}
        onChange={(e) => changeLang(e.target.value)}
        className="border rounded px-2 py-1 text-sm font-medium bg-white dark:bg-gray-800"
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
