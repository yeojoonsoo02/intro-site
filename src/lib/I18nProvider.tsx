'use client';

import { ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { usePathname } from 'next/navigation';
import i18n from './i18n';
import { setLocale, storedLocale } from './locale';
import { isLang } from './site';

export default function I18nProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    // 로케일 접두사가 있는 페이지는 LangInit이 언어를 고정한다.
    // 접두사가 없는 페이지(/journey, /portfolio …)에서만 사용자가 전에 고른 언어를 적용한다.
    const first = pathname.split('/').filter(Boolean)[0];
    if (isLang(first)) return;
    const stored = storedLocale();
    if (stored && stored !== i18n.language) setLocale(stored);
  }, [pathname]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
