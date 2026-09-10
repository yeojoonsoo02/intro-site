import { createInstance, type i18n as I18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { RESOURCES } from '@/locales';
import { LANGS, type Lang } from '@/lib/site';

// 언어는 라우트가 정한다(루트=ko, /{lang}=그 언어). 서버는 요청마다 그 언어로 렌더해야 하고,
// 클라이언트는 서버가 <html lang>에 심은 같은 값으로 시작해야 하이드레이션이 어긋나지 않는다.
// 서버에서 모듈 싱글턴 하나의 언어를 요청마다 바꾸면 동시 요청이 섞이므로 인스턴스를 요청별로 만든다.
export function createI18n(lng: Lang): I18n {
  const instance = createInstance();
  instance.use(initReactI18next).init({
    resources: RESOURCES,
    lng,
    fallbackLng: 'en',
    supportedLngs: [...LANGS],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    initImmediate: false,
  });
  return instance;
}

let clientInstance: I18n | null = null;

/** 브라우저에서는 하나만 쓴다. 첫 호출의 lng는 서버가 심은 <html lang>과 같아야 한다. */
export function getClientI18n(lng: Lang): I18n {
  if (!clientInstance) clientInstance = createI18n(lng);
  return clientInstance;
}
