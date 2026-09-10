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
  // 메타데이터는 스트리밍이라 여기서 notFound()를 던져도 상태 코드가 바뀌지 않는다.
  // 404는 아래 페이지 컴포넌트의 notFound()가 확정한다(루트에 loading.tsx가 없어 셸이 먼저 흘러가지 않는다).
  if (!isLang(lang) || lang === 'ko') return {};
  return buildAboutMetadata(lang);
}

export default async function LocaleAbout({ params }: Params) {
  const { lang } = await params;
  if (!isLang(lang) || lang === 'ko') notFound();
  return <AboutPage lang={lang} />;
}
