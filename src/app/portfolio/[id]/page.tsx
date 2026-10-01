import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPortfolioData } from '@/features/portfolio/portfolioData'
import { oneLiner } from '@/features/portfolio/projectUtils'
import { SITE_URL } from '@/lib/site'
import ProjectDetailClient from './ProjectDetailClient'

type Params = { params: Promise<{ id: string }> }

// 상세 페이지마다 자기 제목·설명·canonical을 갖는다. 예전엔 전부 클라이언트 렌더라
// 포트폴리오 레이아웃의 canonical(/portfolio)을 물려받아, 검색엔진에 "목록의 중복"으로 신고됐다.
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const url = `${SITE_URL}/portfolio/${id}`
  const project = (await getPortfolioData('ko'))?.projects.find((p) => p.id === id)
  // 없는 id는 아래 페이지의 notFound()가 404를 확정한다. Firestore를 못 읽은 경우에도
  // canonical만은 자기 주소로 둔다.
  if (!project) return { alternates: { canonical: url } }

  const title = `${project.title} — 포트폴리오 | 여준수`
  const description = oneLiner(project)
  return {
    // root layout의 title.template('%s | 여준수') 중복 적용을 차단
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: '여준수 자기소개',
      locale: 'ko_KR',
      type: 'article',
    },
    twitter: { card: 'summary', title, description },
  }
}

export default async function ProjectDetailPage({ params }: Params): Promise<JSX.Element> {
  const { id } = await params
  const data = await getPortfolioData('ko')
  // 데이터를 읽었는데 그 id가 없을 때만 404. 못 읽었을 때(null)는 브라우저가 API로 다시 시도한다 —
  // 일시 장애를 "없는 페이지"로 색인시키지 않기 위함.
  if (data && !data.projects.some((p) => p.id === id)) notFound()

  return <ProjectDetailClient id={id} initialProjects={data?.projects ?? null} />
}
