// /about은 서버 컴포넌트라 react-i18next(클라이언트 로더)를 쓸 수 없다.
// 이미 9개 언어가 갖춰진 로케일 JSON을 그대로 가져다 쓴다 — 번역을 새로 지어내지 않기 위함.
import ko from '../../../public/locales/ko.json';
import en from '../../../public/locales/en.json';
import ja from '../../../public/locales/ja.json';
import zh from '../../../public/locales/zh.json';
import es from '../../../public/locales/es.json';
import fr from '../../../public/locales/fr.json';
import de from '../../../public/locales/de.json';
import pt from '../../../public/locales/pt.json';
import ru from '../../../public/locales/ru.json';

type Dict = Record<string, string>;

const DICTS: Record<string, Dict> = {
  ko: ko as Dict,
  en: en as Dict,
  ja: ja as Dict,
  zh: zh as Dict,
  es: es as Dict,
  fr: fr as Dict,
  de: de as Dict,
  pt: pt as Dict,
  ru: ru as Dict,
};

export function getLabels(lang: string): (key: string, fallback?: string) => string {
  const dict = DICTS[lang] ?? DICTS.en;
  const enDict = DICTS.en;
  return (key, fallback) => dict[key] || enDict[key] || fallback || key;
}
