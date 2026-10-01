import type { Metadata, Viewport } from "next";
import RootShell from "../RootShell";
import { ROOT_METADATA, ROOT_VIEWPORT } from "../rootMetadata";

// 한국어 쪽 루트 레이아웃 — 접두사 없는 경로(/, /about, /journey, /portfolio)가 여기 속한다.
//
// 루트 레이아웃을 (ko)와 [lang] 둘로 나눈 이유: 예전엔 app/layout.tsx 하나가 <html lang>을
// 정하려고 headers()로 경로를 읽었고, 그 한 줄 때문에 모든 페이지가 요청마다 서버 렌더됐다
// (generateStaticParams가 있어도 사전 렌더 0건, 응답은 no-store). 언어를 레이아웃의 위치로
// 정하면 요청 시점 API가 필요 없어 페이지를 미리 만들어 둘 수 있다.
export const metadata: Metadata = ROOT_METADATA;
export const viewport: Viewport = ROOT_VIEWPORT;

export default function KoreanRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootShell lang="ko">{children}</RootShell>;
}
