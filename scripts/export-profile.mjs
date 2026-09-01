// knowledge.ts + Firestore 포트폴리오(ko)를 하나의 Markdown 정본으로 합쳐
// 개인 플랫폼(db.yeojoonsoo02.com)의 /api/external/profile 로 업로드한다.
// 실행: npm run profile:sync  (GEMINI 키 불필요, FIREBASE_SERVICE_ACCOUNT_KEY + CONTEXT_API_KEY 필요)
// knowledge.ts를 고쳤으면 이 스크립트도 다시 돌려 플랫폼 정본을 갱신할 것.

import { readFileSync } from 'node:fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const PROFILE_API_URL =
  process.env.PROFILE_API_URL || 'https://db.yeojoonsoo02.com/api/external/profile'

function readKnowledge() {
  const src = readFileSync(new URL('../src/data/knowledge.ts', import.meta.url), 'utf8')
  const m = src.match(/`([\s\S]*)`/)
  if (!m) throw new Error('knowledge.ts에서 KNOWLEDGE 템플릿 리터럴을 찾지 못함')
  return m[1].trim()
}

async function readPortfolio() {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!key) throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY 미설정')
  const db = getFirestore(initializeApp({ credential: cert(JSON.parse(key)) }))
  const col = db.collection('portfolio')
  const ids = ['timeline', 'projects', 'skills', 'certifications', 'testimonials', 'goals', 'values', 'routine']
  const snaps = await Promise.all(ids.map((id) => col.doc(`${id}_ko`).get()))
  const out = []

  const data = Object.fromEntries(ids.map((id, i) => [id, snaps[i].data()]))

  if (data.timeline?.items?.length) {
    out.push('# 연표\n' + data.timeline.items
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((i) => `- ${i.year} ${i.title}: ${i.description}`).join('\n'))
  }
  if (data.projects?.items?.length) {
    out.push('# 공개 프로젝트\n' + data.projects.items
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((i) => `- ${i.title}${i.liveUrl ? ` (${i.liveUrl})` : ''}: ${i.description} [${(i.tags || []).join(', ')}]`)
      .join('\n'))
  }
  if (data.skills?.categories?.length) {
    out.push('# 기술 숙련도 (1~5)\n' + data.skills.categories
      .map((c) => `- ${c.name}: ${c.items.map((s) => `${s.name}(${s.level})`).join(', ')}`).join('\n'))
  }
  if (data.certifications?.items?.length) {
    out.push('# 자격증\n' + data.certifications.items
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((i) => `- ${i.name} (${i.issuer})`).join('\n'))
  }
  if (data.routine?.items?.length) {
    out.push('# 하루 루틴\n' + data.routine.items
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((i) => `- ${i.time}: ${i.content}`).join('\n'))
  }
  if (data.goals?.items?.length) {
    out.push('# 인생 목표\n' + data.goals.items
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((i) => `- ${i.content}`).join('\n'))
  }
  if (data.values?.items?.length) {
    out.push('# 신념\n' + data.values.items
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((i) => `- ${i.content}`).join('\n'))
  }
  if (data.testimonials?.items?.length) {
    out.push('# 고객 후기\n' + data.testimonials.items
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((i) => `- ${i.name}(${i.role}): "${i.content}"`).join('\n'))
  }
  return out.join('\n\n')
}

async function main() {
  // 쓰기는 전용 키 우선 (Vercel에 PROFILE_WRITE_API_KEY 설정 시 읽기/쓰기 분리 완성)
  const apiKey = process.env.PROFILE_WRITE_API_KEY || process.env.CONTEXT_API_KEY
  if (!apiKey) throw new Error('PROFILE_WRITE_API_KEY(또는 CONTEXT_API_KEY) 미설정')

  const generated = new Date().toISOString()
  const markdown = [
    '<!-- AI Profile — 여준수. intro-site `npm run profile:sync` 가 생성한 정본. 직접 편집 금지. -->',
    `<!-- generated: ${generated} | sources: knowledge.ts + Firestore portfolio(ko) -->`,
    '',
    '이 문서는 여준수 본인이 확인한 사실만 담은 AI용 프로필이다.',
    '실시간 상태(현재 위치·수면·일정·날씨)는 /api/external/context 에서 조회한다.',
    '',
    readKnowledge(),
    '',
    await readPortfolio(),
    '',
  ].join('\n')

  const res = await fetch(PROFILE_API_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ markdown }),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.success) {
    throw new Error(`업로드 실패: HTTP ${res.status} ${JSON.stringify(json)}`)
  }
  console.log(`업로드 완료: ${json.bytes} bytes → ${PROFILE_API_URL} (updatedAt ${json.updatedAt})`)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
