'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setLocale } from '@/lib/locale';
import type { Lang } from '@/lib/site';

// 로케일 라우트가 자기 언어를 고정한다. i18next·localStorage·NEXT_LOCALE 쿠키·<html lang>을
// 한 번에 맞춰 SSR(라우트 언어)↔CSR 불일치와 미들웨어 되돌림을 없앤다.
export default function LangInit({ lang }: { lang: Lang }) {
  const { i18n } = useTranslation();
  useEffect(() => {
    setLocale(i18n, lang);
  }, [i18n, lang]);
  return null;
}
