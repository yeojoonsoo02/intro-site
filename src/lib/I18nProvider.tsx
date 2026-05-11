'use client';
import { ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

/**
 * i18n 초기화 skeleton은 SSR(HTML 미초기화)과 클라이언트(useState 초기값) 사이에서
 * hydration mismatch를 일으켜 제거. 실제 콘텐츠를 그대로 SSR에 내보내고 i18n은
 * 클라이언트에서 백그라운드로 초기화. t() 호출은 defaultValue로 안전하게 처리됨.
 */
export default function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    const handleInit = () => {
      document.documentElement.lang = i18n.language;
    };
    i18n.on('initialized', handleInit);
    return () => {
      i18n.off('initialized', handleInit);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
