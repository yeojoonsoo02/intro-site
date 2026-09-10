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
  // 상태 코드는 레이아웃의 assertKnownPath가 확정한다. 여기서 notFound()를 던져도 메타데이터는
  // 스트리밍이라 404가 되지 않으므로 빈 메타만 돌려준다.
  if (!isLang(lang) || lang === 'ko') return {};
  return buildAboutMetadata(lang);
}

export default async function LocaleAbout({ params }: Params) {
  const { lang } = await params;
  if (!isLang(lang) || lang === 'ko') notFound();
  return <AboutPage lang={lang} />;
}
