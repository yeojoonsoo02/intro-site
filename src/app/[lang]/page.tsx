import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildHomeMetadata, HomePage } from '../homePage';
import { isLang, PREFIXED_LANGS } from '@/lib/site';

// 한국어를 뺀 8개 로케일 홈. 목록은 site.ts가 단일 출처다.
export const dynamicParams = false;

export function generateStaticParams() {
  return PREFIXED_LANGS.map((lang) => ({ lang }));
}

type Params = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang) || lang === 'ko') notFound();
  return buildHomeMetadata(lang);
}

export default async function LocaleHome({ params }: Params) {
  const { lang } = await params;
  if (!isLang(lang) || lang === 'ko') notFound();
  return <HomePage lang={lang} />;
}
