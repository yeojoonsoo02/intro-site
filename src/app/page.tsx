import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import LangInit from '@/lib/LangInit';
import { buildHreflangLanguages } from '@/lib/seo-utils';

const SITE_URL = 'https://yeojoonsoo02.com';

export const metadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
    languages: buildHreflangLanguages(),
  },
};

// 루트(/)는 1차 언어인 한국어를 대표. LangInit로 한국어를 고정해 SSR(ko)↔CSR 언어 불일치 제거.
export default function Home() {
  return (
    <>
      <LangInit lang="ko" />
      <HomeClient />
    </>
  );
}
