import 'server-only';
import { adminDb } from '@/lib/firebaseAdmin';
import { cachedByKey } from '@/lib/cached';
import type { Lang } from '@/lib/site';
import type {
  Certification, Education, GoalItem, HobbyCategory, PersonalInfoItem,
  PortfolioHero, PortfolioSummary, Project, SkillCategory, TimelineItem, ValueQuote,
} from './portfolio.model';

// 포트폴리오 데이터를 서버에서 읽는 단일 통로. /api/portfolio와 포트폴리오 페이지(서버 렌더)가
// 같은 캐시를 나눠 쓴다 — 방문마다 Firestore 문서 11개를 여는 일을 막는다.
const TTL = 10 * 60 * 1000;
const ERROR_TTL = 60 * 1000;

// 포트폴리오 데이터가 실제로 있는 언어. 나머지 로케일(es·fr·de·pt·ru)은 영어판을 보여준다 —
// 문서가 없어 화면이 통째로 비던 문제. 없는 번역을 지어내지 않고 있는 영어판을 그대로 쓴다.
const DATA_LANGS: readonly Lang[] = ['ko', 'en', 'ja', 'zh'];
const FALLBACK_LANG: Lang = 'en';

export interface PortfolioPayload {
  hero: PortfolioHero | null;
  summary: PortfolioSummary | null;
  projects: Project[];
  skills: SkillCategory[];
  timeline: TimelineItem[];
  education: Education[];
  certifications: Certification[];
  personalInfo: PersonalInfoItem[];
  goals: GoalItem[];
  values: ValueQuote[];
  hobbies: HobbyCategory[];
}

const DOCS = [
  'hero', 'summary', 'projects', 'skills', 'timeline',
  'education', 'certifications', 'personalInfo', 'goals', 'values', 'hobbies',
] as const;
type DocName = (typeof DOCS)[number];

async function load(lang: Lang): Promise<PortfolioPayload | null> {
  if (!adminDb) return null;
  const col = adminDb.collection('portfolio');
  const snaps = await Promise.all(DOCS.map((d) => col.doc(`${d}_${lang}`).get()));

  const doc = (name: DocName): FirebaseFirestore.DocumentData | undefined =>
    snaps[DOCS.indexOf(name)].data();
  const list = <T>(name: DocName, key: 'items' | 'categories'): T[] => {
    const raw = doc(name)?.[key];
    return Array.isArray(raw) ? (raw as T[]) : [];
  };

  return {
    hero: (doc('hero') as PortfolioHero | undefined) ?? null,
    summary: (doc('summary') as PortfolioSummary | undefined) ?? null,
    projects: list<Project>('projects', 'items'),
    skills: list<SkillCategory>('skills', 'categories'),
    timeline: list<TimelineItem>('timeline', 'items'),
    education: list<Education>('education', 'items'),
    certifications: list<Certification>('certifications', 'items'),
    personalInfo: list<PersonalInfoItem>('personalInfo', 'items'),
    goals: list<GoalItem>('goals', 'items'),
    values: list<ValueQuote>('values', 'items'),
    hobbies: list<HobbyCategory>('hobbies', 'categories'),
  };
}

const getCached = cachedByKey<Lang, PortfolioPayload | null>(load, () => null, {
  ttl: TTL,
  errorTtl: ERROR_TTL,
  name: 'portfolioData',
});

/** 그 언어의 포트폴리오. Firestore를 쓸 수 없으면(키 없음·장애) null. */
export function getPortfolioData(lang: Lang): Promise<PortfolioPayload | null> {
  return getCached(DATA_LANGS.includes(lang) ? lang : FALLBACK_LANG);
}
