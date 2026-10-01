'use client'

import { ProjectMissing } from './ProjectDetailClient'

// page.tsx의 notFound()가 여기로 온다 — 상태 코드는 404, 화면은 목록으로 돌아가는 안내.
export default function ProjectNotFound(): JSX.Element {
  return <ProjectMissing />
}
