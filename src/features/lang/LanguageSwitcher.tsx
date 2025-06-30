'use client';
import { useEffect, useState } from 'react';
import { i18n } from 'next-i18next';
import { useTranslation } from 'next-i18next';

const LANGS = [
  { code: 'ko', label: '🇰🇷 Korean' },
  { code: 'en', label: '🇺🇸 English' },
];

export default function LanguageSwitcher() {
  const [lang, setLang] = useState('en');
  const { t } = useTranslation();

  useEffect(() => {
    if (i18n && i18n.language) {
      setLang(i18n.language);
    }
  }, []);

  const changeLang = (l: string) => {
    if (!i18n) return;
    i18n.changeLanguage(l);
    document.documentElement.lang = l;
    localStorage.setItem('lang', l);
    setLang(l);
  };

  return (
    <label className="flex items-center gap-1 text-sm">
      <span role="img" aria-label="language">🌐</span> {t('language')}
      <select
        value={lang}
        onChange={(e) => changeLang(e.target.value)}
        className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800"
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
