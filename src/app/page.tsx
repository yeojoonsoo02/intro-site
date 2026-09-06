import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import LangInit from '@/lib/LangInit';
import { buildHreflangLanguages } from '@/lib/seo-utils';

const SITE_URL = 'https://yeojoonsoo02.com';

export const metadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
    languages: buildHreflangLanguages(),
  },
};

// 루트(/)는 1차 언어인 한국어를 대표. LangInit로 한국어를 고정해 SSR(ko)↔CSR 언어 불일치 제거.
export default function Home() {
  return (
    <>
      <LangInit lang="ko" />
      <HomeClient />
      <SiteLinks />
    </>
  );
}

/**
 * 하위 페이지로 가는 크롤 가능한 링크.
 *
 * 홈의 서버 HTML 에 있던 내부 링크는 /about 하나뿐이라, /journey 와 /portfolio 로
 * 가는 경로가 사이트맵밖에 없었다. 그 사이트맵이 7주간 재수집되지 않는 동안
 * /journey 는 색인조차 되지 않았다. 링크는 서버 컴포넌트에서 그린다 —
 * 클라이언트에서만 그리면 첫 HTML 에 남지 않는다.
 */
function SiteLinks() {
  const links = [
    { href: '/about', label: '소개' },
    { href: '/journey', label: '여정' },
    { href: '/portfolio', label: '포트폴리오' },
    { href: 'https://blog.yeojoonsoo02.com', label: '블로그' },
  ];

  return (
    <nav
      aria-label="여준수 사이트 안내"
      className="mx-auto max-w-xl px-4 pb-10 text-center text-sm"
      style={{ color: 'var(--muted)' }}
    >
      <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} className="transition-opacity hover:opacity-70 underline-offset-4 hover:underline">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
