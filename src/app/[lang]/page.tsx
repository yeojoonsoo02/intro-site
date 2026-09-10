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
  // 메타데이터는 스트리밍이라 여기서 notFound()를 던져도 상태 코드가 바뀌지 않는다.
  // 404는 아래 페이지 컴포넌트의 notFound()가 확정한다(루트에 loading.tsx가 없어 셸이 먼저 흘러가지 않는다).
  if (!isLang(lang) || lang === 'ko') return {};
  return buildHomeMetadata(lang);
}

export default async function LocaleHome({ params }: Params) {
  const { lang } = await params;
  if (!isLang(lang) || lang === 'ko') notFound();
  return <HomePage lang={lang} />;
}
