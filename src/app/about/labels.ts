// /about은 서버 컴포넌트라 react-i18next를 쓸 수 없다. 같은 로케일 사전을 직접 읽는다.
import { DICTS } from '@/locales';
import { isLang } from '@/lib/site';

export function getLabels(lang: string): (key: string, fallback?: string) => string {
  const dict = isLang(lang) ? DICTS[lang] : DICTS.en;
  const enDict = DICTS.en;
  return (key, fallback) => dict[key] || enDict[key] || fallback || key;
}
