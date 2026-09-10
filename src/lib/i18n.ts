import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { RESOURCES } from '@/locales';
import { isLang, LANGS } from '@/lib/site';

// 언어는 라우트가 정한다(루트=ko, /{lang}=그 언어). 서버가 <html lang>에 그 값을 심으므로
// 클라이언트도 같은 값으로 시작해야 하이드레이션이 어긋나지 않는다.
// 로케일이 없는 페이지(/journey, /portfolio)에서의 사용자 선호는 I18nProvider가
// 하이드레이션 뒤에 적용한다.
function initialLang(): string {
  if (typeof document === 'undefined') return 'ko';
  const fromHtml = document.documentElement.lang;
  return isLang(fromHtml) ? fromHtml : 'ko';
}

i18n.use(initReactI18next).init({
  resources: RESOURCES,
  lng: initialLang(),
  fallbackLng: 'en',
  supportedLngs: [...LANGS],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
