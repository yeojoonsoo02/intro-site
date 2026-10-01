import type { Metadata, Viewport } from "next";
import RootShell from "../RootShell";
import { ROOT_METADATA, ROOT_VIEWPORT } from "../rootMetadata";
import { isLang, PREFIXED_LANGS } from "@/lib/site";

// 한국어를 뺀 8개 로케일의 루트 레이아웃(/{lang}, /{lang}/about). 한국어 쪽은 (ko)/layout.tsx.
// 언어는 경로 파라미터에서 온다 — headers()를 읽지 않으므로 사전 렌더된다.
export const metadata: Metadata = ROOT_METADATA;
export const viewport: Viewport = ROOT_VIEWPORT;

// 목록에 없는 /{아무거나}는 여기서 404로 끝난다(global-not-found가 받는다).
export const dynamicParams = false;

export function generateStaticParams() {
  return PREFIXED_LANGS.map((lang) => ({ lang }));
}

export default async function LocaleRootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  // dynamicParams=false라 지원 언어만 들어온다. 타입을 좁히기 위한 확인.
  return <RootShell lang={isLang(lang) ? lang : "en"}>{children}</RootShell>;
}
