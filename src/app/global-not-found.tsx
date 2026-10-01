import type { Metadata } from 'next';
import RootShell from './RootShell';
import { SITE_URL } from '@/lib/site';
import NotFound from './(ko)/not-found';

// 어떤 라우트에도 맞지 않는 주소(/xyz, /a/b/c …)의 404. 루트 레이아웃이 둘((ko)·[lang])이라
// app/not-found.tsx 하나로는 받을 수 없어 이 규약을 쓴다(next.config의 experimental.globalNotFound).
// 레이아웃을 거치지 않으므로 <html>부터 직접 그린다 — 공통 껍데기(RootShell)를 그대로 쓴다.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: '404 — 페이지를 찾을 수 없습니다',
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <RootShell lang="ko">
      <NotFound />
    </RootShell>
  );
}
