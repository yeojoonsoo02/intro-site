// 9개 언어 UI 문자열. 번들에 포함해 첫 페인트부터 번역이 있게 한다 —
// 예전엔 런타임에 /locales/{lng}.json을 fetch해서 첫 화면에 키 이름이 잠깐 보였고,
// 서버 컴포넌트(/about)는 같은 파일을 따로 import하는 두 번째 시스템을 갖고 있었다.
import type { Lang } from '@/lib/site';
import ko from './ko.json';
import en from './en.json';
import ja from './ja.json';
import zh from './zh.json';
import es from './es.json';
import fr from './fr.json';
import de from './de.json';
import pt from './pt.json';
import ru from './ru.json';

export type Dict = Record<string, string>;

export const DICTS: Record<Lang, Dict> = { ko, en, ja, zh, es, fr, de, pt, ru };

/** i18next resources 형태 */
export const RESOURCES = Object.fromEntries(
  Object.entries(DICTS).map(([lang, dict]) => [lang, { translation: dict }]),
) as Record<Lang, { translation: Dict }>;
