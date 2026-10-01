import type { Metadata } from 'next';
import { buildHomeMetadata, HomePage } from '../homePage';

// 미리 만들어 두고 10분마다 다시 만든다 — Firestore 프로필 수정이 그 안에 반영된다.
export const revalidate = 600;

// 루트(/)는 1차 언어인 한국어를 대표한다. 다른 언어는 /[lang]에서 같은 화면을 그린다.
export const metadata: Metadata = buildHomeMetadata('ko');

export default function Home() {
  return <HomePage lang="ko" />;
}
