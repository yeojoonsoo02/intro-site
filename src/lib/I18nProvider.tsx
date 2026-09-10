'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { usePathname } from 'next/navigation';
import { createI18n, getClientI18n } from './i18n';
import { setLocale, storedLocale } from './locale';
import { isLang, type Lang } from './site';

export default function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  // 서버: 요청별 인스턴스(라우트 언어). 클라이언트: 싱글턴(같은 언어로 시작 → 하이드레이션 일치).
  const [i18n] = useState(() =>
    typeof window === 'undefined' ? createI18n(lang) : getClientI18n(lang),
  );
  const pathname = usePathname();

  useEffect(() => {
    // 로케일 접두사가 있는 페이지는 LangInit이 언어를 고정한다.
    // 접두사가 없는 페이지(/journey, /portfolio …)에서만 사용자가 전에 고른 언어를 적용한다.
    const first = pathname.split('/').filter(Boolean)[0];
    if (isLang(first)) return;
    const stored = storedLocale();
    if (stored && stored !== i18n.language) setLocale(i18n, stored);
  }, [pathname, i18n]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
