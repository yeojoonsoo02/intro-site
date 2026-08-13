import 'server-only';
import { adminDb } from '@/lib/firebaseAdmin';
import { DEFAULT_PROFILES } from '@/features/profile/defaultProfiles';
import type { Profile } from '@/features/profile/profile.model';

// /about이 쓰는 데이터를 서버에서 직접 읽는다.
//
// 왜 서버에서: 클라이언트가 Firestore에 붙으면 googleapis가 차단된 망에서 비어버리고,
// 별도 API를 두면 왕복이 하나 더 생긴다. 서버 컴포넌트에서 바로 읽는 게 가장 빠르고 안전하다.
//
// 왜 캐시: 방문마다 Firestore를 열 필요가 없다. 콘텐츠 변경 빈도가 낮아 10분이면 충분하다.

const TTL = 10 * 60 * 1000;
const ERROR_TTL = 60 * 1000;

// 포트폴리오 데이터가 실제로 있는 언어. 나머지 로케일은 고유명사 위주 섹션만
// 영어 데이터로 채우고, 산문형(후기·목표·가치관)은 아예 넣지 않는다 —
// 없는 내용을 번역해 지어내지 않기 위함.
const RICH_LANGS = ['ko', 'en', 'ja', 'zh'] as const;
const NEUTRAL_FALLBACK = 'en';

export interface SkillCategory {
  name: string;
  items: string[];
}

export interface Certification {
  name: string;
  issuer: string;
}

export interface Testimonial {
  name: string;
  role: string;
  content: string;
}

export interface AboutData {
  profile: Profile;
  skills: SkillCategory[];
  certifications: Certification[];
  testimonials: Testimonial[];
  goals: string[];
  values: string[];
  /** "광운대학교 — 소프트웨어학과 — 2021.03 ~ 재학 중" 형태의 한 줄 */
  education: string;
  /** 산문형 섹션(후기·목표·가치관)을 그 언어로 보여줄 수 있는지 */
  hasProse: boolean;
}

interface CacheEntry {
  data: AboutData;
  expiry: number;
}

const cache = new Map<string, CacheEntry>();

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function list(data: FirebaseFirestore.DocumentData | undefined, key: string): Record<string, unknown>[] {
  const raw = data?.[key];
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
}

function emptyData(lang: string): AboutData {
  return {
    profile: DEFAULT_PROFILES[lang] ?? DEFAULT_PROFILES.en,
    skills: [],
    certifications: [],
    testimonials: [],
    goals: [],
    values: [],
    education: '',
    hasProse: false,
  };
}

export async function getAboutData(lang: string): Promise<AboutData> {
  const cached = cache.get(lang);
  if (cached && Date.now() < cached.expiry) return cached.data;

  const fallback = emptyData(lang);
  if (!adminDb) return fallback;

  const hasProse = (RICH_LANGS as readonly string[]).includes(lang);
  // 산문이 없는 언어라도 기술 스택·자격증은 고유명사 위주라 영어판을 쓰면 도움이 된다.
  const dataLang = hasProse ? lang : NEUTRAL_FALLBACK;

  try {
    const col = adminDb.collection('portfolio');
    const [profileSnap, skillsSnap, certSnap, eduSnap, testiSnap, goalsSnap, valuesSnap] =
      await Promise.all([
        adminDb.collection('profiles').doc(`main_${lang}`).get(),
        col.doc(`skills_${dataLang}`).get(),
        col.doc(`certifications_${dataLang}`).get(),
        col.doc(`education_${dataLang}`).get(),
        hasProse ? col.doc(`testimonials_${lang}`).get() : Promise.resolve(null),
        hasProse ? col.doc(`goals_${lang}`).get() : Promise.resolve(null),
        hasProse ? col.doc(`values_${lang}`).get() : Promise.resolve(null),
      ]);

    const data: AboutData = {
      // Firestore 프로필이 있으면 그것을, 없으면 정적 기본값. 관리자 수정이 바로 반영된다.
      profile: profileSnap.exists
        ? { ...fallback.profile, ...(profileSnap.data() as Partial<Profile>) }
        : fallback.profile,
      skills: list(skillsSnap.data(), 'categories')
        .map((c) => ({
          name: str(c.name),
          items: Array.isArray(c.items)
            ? (c.items as unknown[])
                .map((i) => (typeof i === 'string' ? i : str((i as Record<string, unknown>)?.name)))
                .filter(Boolean)
            : [],
        }))
        .filter((c) => c.name && c.items.length > 0),
      certifications: list(certSnap.data(), 'items')
        .map((c) => ({ name: str(c.name), issuer: str(c.issuer) }))
        .filter((c) => c.name),
      testimonials: list(testiSnap?.data(), 'items')
        .map((t) => ({ name: str(t.name), role: str(t.role), content: str(t.content) }))
        .filter((t) => t.content),
      // 첫 항목(대학)만 한 줄로. 상세 학력은 포트폴리오 페이지의 몫이다.
      education: (() => {
        const first = list(eduSnap.data(), 'items')[0];
        if (!first) return '';
        return [str(first.school), str(first.major), str(first.period)].filter(Boolean).join(' · ');
      })(),
      goals: list(goalsSnap?.data(), 'items').map((g) => str(g.content)).filter(Boolean),
      values: list(valuesSnap?.data(), 'items').map((v) => str(v.content)).filter(Boolean),
      hasProse,
    };

    cache.set(lang, { data, expiry: Date.now() + TTL });
    return data;
  } catch (err) {
    console.error('[about] data load failed, using defaults:', err);
    // 실패해도 페이지는 떠야 한다. 짧게 캐시해 장애 중 Firestore를 계속 두드리지 않는다.
    cache.set(lang, { data: fallback, expiry: Date.now() + ERROR_TTL });
    return fallback;
  }
}
