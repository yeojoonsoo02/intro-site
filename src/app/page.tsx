import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import { buildHreflangLanguages } from '@/lib/seo-utils';

const SITE_URL = 'https://yeojoonsoo02.com';

export const metadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
    languages: buildHreflangLanguages(),
  },
};

export default function Home() {
  return <HomeClient />;
}
