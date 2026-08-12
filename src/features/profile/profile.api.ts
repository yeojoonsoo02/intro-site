import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Profile } from './profile.model';

// 읽기는 서버 API(/api/profile)로 간다 — 브라우저가 firestore.googleapis.com에
// 직접 붙으면 그 도메인이 차단된 망에서 랜딩 콘텐츠가 통째로 비어버린다.
// 쓰기는 관리자만 하는 동작이고 Firestore Rules(관리자 이메일)로 보호되므로 그대로 둔다.

interface ProfileResponse {
  main: Profile | null;
  dev: Profile | null;
}

// 카드가 main/dev를 따로 요청하는데 응답은 한 번에 온다. 같은 언어의 동시 요청은
// 하나로 묶어 네트워크 왕복과 함수 호출을 절반으로 줄인다.
const inflight = new Map<string, Promise<ProfileResponse>>();

async function fetchProfiles(lang: string): Promise<ProfileResponse> {
  const pending = inflight.get(lang);
  if (pending) return pending;

  const promise = (async () => {
    try {
      const res = await fetch(`/api/profile?lang=${encodeURIComponent(lang)}`);
      if (!res.ok) throw new Error(`Profile API ${res.status}`);
      return (await res.json()) as ProfileResponse;
    } finally {
      inflight.delete(lang);
    }
  })();

  inflight.set(lang, promise);
  return promise;
}

export async function fetchProfile(lang: string = 'en'): Promise<Profile | null> {
  return (await fetchProfiles(lang)).main;
}

export async function fetchDevProfile(lang: string = 'en'): Promise<Profile | null> {
  return (await fetchProfiles(lang)).dev;
}

function profileDoc(lang: string = 'en') {
  return doc(db, 'profiles', `main_${lang}`);
}

function devProfileDoc(lang: string = 'en') {
  return doc(db, 'profiles', `dev_${lang}`);
}

export async function saveProfile(profile: Profile, lang: string = 'en') {
  await setDoc(profileDoc(lang), profile, { merge: true });
}

export async function saveDevProfile(profile: Profile, lang: string = 'en') {
  await setDoc(devProfileDoc(lang), profile, { merge: true });
}
