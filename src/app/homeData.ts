import 'server-only';
import { adminDb } from '@/lib/firebaseAdmin';
import { cachedByKey } from '@/lib/cached';
import { DEFAULT_PROFILES } from '@/features/profile/defaultProfiles';
import type { Profile } from '@/features/profile/profile.model';
import type { Project } from '@/features/portfolio/portfolio.model';

// 홈이 쓰는 데이터를 서버에서 직접 읽는다(aboutData와 같은 이유: 브라우저가 Firestore에
// 붙으면 googleapis가 차단된 망에서 첫 화면이 비고, SEO도 서버 HTML에 있어야 한다).
const TTL = 10 * 60 * 1000;
const ERROR_TTL = 60 * 1000;
const FEATURED_COUNT = 3;

// 포트폴리오 데이터가 실제로 있는 언어. 나머지는 영어 데이터로 대표 프로젝트를 채운다.
const RICH_LANGS = ['ko', 'en', 'ja', 'zh'] as const;
const NEUTRAL_FALLBACK = 'en';

export interface HomeData {
  profile: Profile;
  featured: Project[];
}

function emptyData(lang: string): HomeData {
  return { profile: DEFAULT_PROFILES[lang] ?? DEFAULT_PROFILES.en, featured: [] };
}

async function loadHomeData(lang: string): Promise<HomeData> {
  const fallback = emptyData(lang);
  if (!adminDb) return fallback;

  const dataLang = (RICH_LANGS as readonly string[]).includes(lang) ? lang : NEUTRAL_FALLBACK;
  const [profileSnap, projectsSnap] = await Promise.all([
    adminDb.collection('profiles').doc(`main_${lang}`).get(),
    adminDb.collection('portfolio').doc(`projects_${dataLang}`).get(),
  ]);

  const items = (projectsSnap.data()?.items ?? []) as Project[];
  const featured = items
    .filter((p) => p && p.featured && typeof p.title === 'string')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, FEATURED_COUNT);

  return {
    profile: profileSnap.exists
      ? { ...fallback.profile, ...(profileSnap.data() as Partial<Profile>) }
      : fallback.profile,
    featured,
  };
}

export const getHomeData = cachedByKey(loadHomeData, emptyData, {
  ttl: TTL,
  errorTtl: ERROR_TTL,
  name: 'homeData',
});
