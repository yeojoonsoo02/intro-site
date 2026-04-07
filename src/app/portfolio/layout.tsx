import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '포트폴리오 | 여준수',
  description: '여준수의 프로젝트, 기술 스택, 경력을 확인할 수 있는 포트폴리오 페이지입니다.',
  alternates: {
    canonical: 'https://yeojoonsoo02.com/portfolio',
  },
  openGraph: {
    title: '포트폴리오 | 여준수',
    description: '여준수의 프로젝트, 기술 스택, 경력을 확인할 수 있는 포트폴리오 페이지입니다.',
    url: 'https://yeojoonsoo02.com/portfolio',
    siteName: '여준수 자기소개',
    locale: 'ko_KR',
    type: 'profile',
  },
  twitter: {
    card: 'summary',
    title: '포트폴리오 | 여준수',
    description: '여준수의 프로젝트, 기술 스택, 경력을 확인할 수 있는 포트폴리오 페이지입니다.',
  },
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
