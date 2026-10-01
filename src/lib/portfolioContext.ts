// 사이트가 화면에 보여주는 포트폴리오 데이터(Firestore)를 챗봇 컨텍스트로 넣는다.
//
// 왜: knowledge.ts에는 프로젝트 요약 정도만 있어서, 방문자가 화면에서 방금 본 내용
// (프로젝트 9개·타임라인·자격증·학력·추천사·MBTI 등)을 물으면 챗봇이 모른다고 답했다.
//
// 무엇을 넣는가: 섹션은 전부 항상 넣는다. 예전엔 질문 키워드에 맞는 섹션만 골라 넣었는데,
// 표현이 조금만 달라도 빗나가 "모르겠어"가 됐고("너 뭐 좋아해?"에 취미 섹션이 안 붙는 식),
// "너무 위험한 것만 빼고 다 준다"가 본인 결정이다(2026-10-01). 전부 사이트에 공개된 내용이다.
// 프로젝트의 케이스 스터디(배경·문제·결정·결과)만은 분량이 커서 프로젝트를 묻는 질문에만 붙인다.
//
// 비용 설계: 임베딩을 쓰지 않는다. Firestore 읽기는 메모리 캐시로 묶어 요청마다 나가지 않는다.

import { adminDb } from '@/lib/firebaseAdmin'
import { cached } from '@/lib/cached'

const TTL = 10 * 60 * 1000
const ERROR_TTL = 60 * 1000
const DEFAULT_MAX_ITEMS = 12
const MAX_VALUE_LENGTH = 300

interface SectionSpec {
  doc: string
  key: 'items' | 'categories'
  heading: string
  format: (data: Record<string, unknown>) => string[]
  maxItems?: number
}

// 프로젝트를 묻는 질문인지. 맞으면 케이스 스터디까지 붙인다.
// 한국어 위주지만 영어·일본어·중국어 질문도 들어와 함께 둔다.
const PROJECT_QUESTION =
  /프로젝트|포트폴리오|만든|만들|개발한|개발했|작업|서비스|앱|사이트|플랫폼|외주|왜 그걸|어려웠|배운|project|portfolio|built|made|プロジェクト|作った|開発|サービス|项目|做过|开发|作品/i

const DETAIL_MAX_LENGTH = 700
const detail = (v: unknown): string => String(v ?? '').replace(/\s+/g, ' ').slice(0, DETAIL_MAX_LENGTH).trim()
const detailList = (v: unknown): string =>
  Array.isArray(v) ? v.map((x) => detail(x)).filter(Boolean).join(' / ') : ''

// 케이스 스터디가 있는 프로젝트의 상세. 값이 없는 항목은 적지 않는다.
function projectDetail(p: Record<string, unknown>): string {
  const decisions = Array.isArray(p.decisions)
    ? (p.decisions as Record<string, unknown>[])
        .map((d) => [detail(d.what), detail(d.why)].filter(Boolean).join(' — '))
        .filter(Boolean)
        .join(' / ')
    : ''
  const head = [line(p.title), line(p.period), line(p.role)].filter(Boolean).join(' · ')
  const fields: [string, string][] = [
    ['한 줄', detail(p.summary) || detail(p.description)],
    ['기술', names(p.tags)],
    ['주소', line(p.liveUrl)],
    ['배경', detail(p.context)],
    ['문제', detail(p.problem)],
    ['결정', decisions],
    ['구현', detailList(p.highlights)],
    ['결과', detailList(p.outcome)],
    ['배운 점', detail(p.lessons)],
  ]
  return [head, ...fields.filter(([, v]) => v).map(([k, v]) => `  ${k}: ${v}`)].join('\n')
}

const line = (v: unknown): string => String(v ?? '').slice(0, MAX_VALUE_LENGTH).trim()

function listOf(data: Record<string, unknown>, key: 'items' | 'categories'): Record<string, unknown>[] {
  const raw = data[key]
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : []
}

// 배열 항목이 문자열일 수도, {name} 객체일 수도 있다(skills는 객체, hobbies는 문자열).
function names(raw: unknown): string {
  if (!Array.isArray(raw)) return ''
  return raw
    .map((v) => (typeof v === 'string' ? v : line((v as Record<string, unknown>)?.name)))
    .filter(Boolean)
    .join(', ')
}

const SECTIONS: SectionSpec[] = [
  {
    doc: 'projects',
    key: 'items',
    heading: '프로젝트',
    format: (d) =>
      listOf(d, 'items').map((p) =>
        [line(p.title), line(p.description), names(p.tags)].filter(Boolean).join(' — '),
      ),
  },
  {
    doc: 'timeline',
    key: 'items',
    heading: '연표·경력',
    format: (d) =>
      listOf(d, 'items').map((t) =>
        [line(t.year), line(t.title), line(t.description)].filter(Boolean).join(' — '),
      ),
  },
  {
    doc: 'certifications',
    key: 'items',
    heading: '자격증',
    format: (d) =>
      listOf(d, 'items').map((c) =>
        [line(c.name), line(c.issuer), line(c.date)].filter(Boolean).join(' — '),
      ),
  },
  {
    doc: 'education',
    key: 'items',
    heading: '학력',
    format: (d) =>
      listOf(d, 'items').map((e) =>
        [line(e.school), line(e.major), line(e.period), line(e.description)]
          .filter(Boolean)
          .join(' — '),
      ),
  },
  {
    doc: 'skills',
    key: 'categories',
    heading: '기술 스택',
    format: (d) =>
      listOf(d, 'categories').map((c) => `${line(c.name)}: ${names(c.items)}`),
  },
  {
    doc: 'personalInfo',
    key: 'items',
    heading: '신상 정보',
    format: (d) => listOf(d, 'items').map((i) => `${line(i.label)}: ${line(i.value)}`),
  },
  {
    doc: 'hobbies',
    key: 'categories',
    heading: '취미·좋아하는 것',
    format: (d) => listOf(d, 'categories').map((c) => `${line(c.name)}: ${names(c.items)}`),
  },
  {
    doc: 'routine',
    key: 'items',
    heading: '하루 루틴',
    format: (d) =>
      listOf(d, 'items').map((r) => [line(r.time), line(r.content)].filter(Boolean).join(' ')),
  },
  {
    doc: 'goals',
    key: 'items',
    heading: '목표',
    format: (d) => listOf(d, 'items').map((g) => line(g.content)),
  },
  {
    doc: 'testimonials',
    key: 'items',
    heading: '주변 평가·외주 후기',
    format: (d) =>
      listOf(d, 'items').map((t) =>
        [line(t.name), line(t.role)].filter(Boolean).join('/') + `: ${line(t.content)}`,
      ),
  },
  {
    doc: 'values',
    key: 'items',
    heading: '가치관',
    format: (d) => listOf(d, 'items').map((v) => line(v.content)),
  },
]

interface CacheEntry {
  sections: Map<string, string>
  summary: string
  /** 프로젝트 섹션의 상세판(케이스 스터디 포함). 프로젝트를 묻는 질문에만 쓴다. */
  projectsDetailed: string
}

const EMPTY: CacheEntry = { sections: new Map(), summary: '', projectsDetailed: '' }

async function loadAll(): Promise<CacheEntry> {
  if (!adminDb) return EMPTY
  const col = adminDb.collection('portfolio')
  const docIds = ['summary', ...SECTIONS.map((s) => s.doc)]
  const snaps = await Promise.all(docIds.map((id) => col.doc(`${id}_ko`).get()))

  const sections = new Map<string, string>()
  let summary = ''

  const summaryData = snaps[0].exists ? (snaps[0].data() as Record<string, unknown>) : null
  if (summaryData) {
    const highlights = Array.isArray(summaryData.highlights)
      ? (summaryData.highlights as Record<string, unknown>[])
          .map((h) => `${line(h.label)} ${line(h.value)}`)
          .join(' · ')
      : ''
    summary = [line(summaryData.bio), highlights].filter(Boolean).join('\n')
  }

  SECTIONS.forEach((spec, i) => {
    const snap = snaps[i + 1]
    if (!snap.exists) return
    const lines = spec.format(snap.data() as Record<string, unknown>).filter(Boolean)
    if (lines.length === 0) return

    const limit = spec.maxItems ?? DEFAULT_MAX_ITEMS
    const shown = lines.slice(0, limit)
    // 모델은 목록을 세지 못한다 — 12개짜리 타임라인을 "14개"라고 답했다.
    // 개수는 항상 제목에 박아두고, 잘렸을 때는 그 사실도 함께 알린다.
    const note =
      lines.length > shown.length
        ? `\n(위는 전체 ${lines.length}개 중 ${shown.length}개만 실었다.)`
        : ''

    sections.set(
      spec.doc,
      `## ${spec.heading} (총 ${lines.length}개)\n${shown.map((l) => `- ${l}`).join('\n')}${note}`,
    )
  })

  const projectsSnap = snaps[1 + SECTIONS.findIndex((s) => s.doc === 'projects')]
  const projects = projectsSnap?.exists ? listOf(projectsSnap.data() as Record<string, unknown>, 'items') : []
  const projectsDetailed =
    projects.length > 0
      ? `## 프로젝트 (총 ${projects.length}개, 상세)\n${projects.map((p) => `- ${projectDetail(p)}`).join('\n')}`
      : ''

  return { sections, summary, projectsDetailed }
}

const getCache = cached(loadAll, EMPTY, { ttl: TTL, errorTtl: ERROR_TTL, name: 'portfolioContext' })

/**
 * 포트폴리오 섹션 전부를 컨텍스트 문자열로 반환한다.
 * 프로젝트를 묻는 질문이면 프로젝트 섹션을 케이스 스터디가 든 상세판으로 바꿔 넣는다.
 */
export async function getPortfolioContext(query: string): Promise<string> {
  const entry = await getCache()
  const wantsDetail = PROJECT_QUESTION.test(query) && entry.projectsDetailed

  const sections = SECTIONS.filter((s) => entry.sections.has(s.doc)).map((s) =>
    s.doc === 'projects' && wantsDetail ? entry.projectsDetailed : entry.sections.get(s.doc)!,
  )

  const parts = [entry.summary && `## 소개\n${entry.summary}`, ...sections].filter(Boolean)
  return parts.length > 0 ? parts.join('\n\n') : ''
}

