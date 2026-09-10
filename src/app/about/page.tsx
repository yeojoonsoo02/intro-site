import type { Metadata } from 'next';
import { AboutPage, buildAboutMetadata } from './aboutPage';

export const metadata: Metadata = buildAboutMetadata('ko');

export default function Page(): JSX.Element {
  return <AboutPage lang="ko" />;
}
