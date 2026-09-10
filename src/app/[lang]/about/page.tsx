import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AboutPage, buildAboutMetadata } from '../../about/aboutPage';
import { isLang, PREFIXED_LANGS } from '@/lib/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return PREFIXED_LANGS.map((lang) => ({ lang }));
}

type Params = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang) || lang === 'ko') notFound();
  return buildAboutMetadata(lang);
}

export default async function LocaleAbout({ params }: Params) {
  const { lang } = await params;
  if (!isLang(lang) || lang === 'ko') notFound();
  return <AboutPage lang={lang} />;
}
