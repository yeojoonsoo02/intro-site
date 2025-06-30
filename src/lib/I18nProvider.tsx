'use client';
import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createConfig } from 'next-i18next/dist/commonjs/config/createConfig';
import createClient from 'next-i18next/dist/commonjs/createClient';
import nextI18NextConfig from '../../next-i18next.config';
import en from '../../public/locales/en.json';
import ko from '../../public/locales/ko.json';

const resources = {
  en: { translation: en },
  ko: { translation: ko },
};

const { i18n } = createClient({
  ...createConfig({ ...nextI18NextConfig, lng: nextI18NextConfig.i18n.defaultLocale }),
  resources,
}).i18n;

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let lang = localStorage.getItem('lang') || navigator.language.split('-')[0];
    if (lang !== 'en' && lang !== 'ko') lang = 'en';
    i18n.changeLanguage(lang).then(() => {
      document.documentElement.lang = lang;
      setReady(true);
    });
  }, []);
  if (!ready) return null;
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
