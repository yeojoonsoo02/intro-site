import PortfolioContent from '@/features/portfolio/PortfolioContent';
import { getPortfolioData } from '@/features/portfolio/portfolioData';
import type { PortfolioData } from '@/features/portfolio/usePortfolioData';

// 미리 만들어 두고 10분마다 다시 만든다 — Firestore 수정이 그 안에 반영된다.
export const revalidate = 600;

// 한국어판을 서버에서 읽어 첫 HTML에 싣는다. 예전엔 브라우저가 받아 와서 서버 HTML이
// "로딩 중..."뿐이었고, 상세 페이지로 가는 링크도 크롤러에 보이지 않았다.
export default async function PortfolioPage() {
  const data = await getPortfolioData('ko');
  // 화면이 쓰는 필드만 넘긴다(신상·취미는 챗봇용이라 HTML에 싣지 않는다).
  const initial: PortfolioData | null = data && {
    hero: data.hero,
    projects: data.projects,
    skills: data.skills,
    timeline: data.timeline,
    education: data.education,
    goals: data.goals,
    values: data.values,
  };

  return (
    <main style={{ background: 'var(--background)' }}>
      <PortfolioContent initial={initial} />
    </main>
  );
}
