import type { Metadata } from 'next';
import { buildHomeMetadata, HomePage } from './homePage';

// 루트(/)는 1차 언어인 한국어를 대표한다. 다른 언어는 /[lang]에서 같은 화면을 그린다.
export const metadata: Metadata = buildHomeMetadata('ko');

export default function Home() {
  return <HomePage lang="ko" />;
}
