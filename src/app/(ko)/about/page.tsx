import type { Metadata } from 'next';
import { AboutPage, buildAboutMetadata } from '../../about/aboutPage';

// 미리 만들어 두고 10분마다 다시 만든다 — Firestore·블로그 RSS 변경이 그 안에 반영된다.
export const revalidate = 600;

export const metadata: Metadata = buildAboutMetadata('ko');

export default function Page(): JSX.Element {
  return <AboutPage lang="ko" />;
}
