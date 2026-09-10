import type { Profile } from './profile.model';

// 읽기는 서버 API(/api/profile)로 간다 — 브라우저가 firestore.googleapis.com에
// 직접 붙으면 그 도메인이 차단된 망에서 랜딩 콘텐츠가 통째로 비어버린다.
// 같은 언어의 동시 요청은 하나로 묶는다.
const inflight = new Map<string, Promise<Profile | null>>();

export async function fetchProfile(lang: string = 'ko'): Promise<Profile | null> {
  const pending = inflight.get(lang);
  if (pending) return pending;
  const promise = (async () => {
    try {
      const res = await fetch(`/api/profile?lang=${encodeURIComponent(lang)}`);
      if (!res.ok) throw new Error(`Profile API ${res.status}`);
      return (await res.json()) as Profile | null;
    } finally {
      inflight.delete(lang);
    }
  })();
  inflight.set(lang, promise);
  return promise;
}
