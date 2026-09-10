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
  // 상태 코드는 레이아웃의 assertKnownPath가 확정한다. 여기서 notFound()를 던져도 메타데이터는
  // 스트리밍이라 404가 되지 않으므로 빈 메타만 돌려준다.
  if (!isLang(lang) || lang === 'ko') return {};
  return buildHomeMetadata(lang);
}

export default async function LocaleHome({ params }: Params) {
  const { lang } = await params;
  if (!isLang(lang) || lang === 'ko') notFound();
  return <HomePage lang={lang} />;
}
