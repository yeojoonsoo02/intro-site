import 'server-only';
import { adminDb } from '@/lib/firebaseAdmin';
import { cachedByKey } from '@/lib/cached';
import { DEFAULT_PROFILES } from '@/features/profile/defaultProfiles';
import type { Profile } from '@/features/profile/profile.model';

// 홈이 쓰는 데이터를 서버에서 직접 읽는다(aboutData와 같은 이유: 브라우저가 Firestore에
// 붙으면 googleapis가 차단된 망에서 첫 화면이 비고, SEO도 서버 HTML에 있어야 한다).
const TTL = 10 * 60 * 1000;
const ERROR_TTL = 60 * 1000;

export interface HomeData {
  profile: Profile;
}

function emptyData(lang: string): HomeData {
  return { profile: DEFAULT_PROFILES[lang] ?? DEFAULT_PROFILES.en };
}

async function loadHomeData(lang: string): Promise<HomeData> {
  const fallback = emptyData(lang);
  if (!adminDb) return fallback;

  const profileSnap = await adminDb.collection('profiles').doc(`main_${lang}`).get();

  return {
    profile: profileSnap.exists
      ? { ...fallback.profile, ...(profileSnap.data() as Partial<Profile>) }
      : fallback.profile,
  };
}

export const getHomeData = cachedByKey(loadHomeData, emptyData, {
  ttl: TTL,
  errorTtl: ERROR_TTL,
  name: 'homeData',
});
