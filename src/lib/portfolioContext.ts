// 사이트가 화면에 보여주는 포트폴리오 데이터(Firestore)를 챗봇 컨텍스트로 넣는다.
//
// 왜: knowledge.ts에는 프로젝트 요약 정도만 있어서, 방문자가 화면에서 방금 본 내용
// (프로젝트 9개·타임라인·자격증·학력·추천사·MBTI 등)을 물으면 챗봇이 모른다고 답했다.
//
// 비용 설계: 임베딩을 쓰지 않는다. 질문의 키워드로 필요한 섹션만 골라 넣으므로
// 임베딩 API 호출이 늘지 않는다. Firestore 읽기도 메모리 캐시로 묶어 요청마다 나가지 않는다.

import { adminDb } from '@/lib/firebaseAdmin'

const TTL = 10 * 60 * 1000
const ERROR_TTL = 60 * 1000
const DEFAULT_MAX_ITEMS = 12
const MAX_VALUE_LENGTH = 300

interface SectionSpec {
  doc: string
  key: 'items' | 'categories'
  heading: string
  // 이 섹션을 끌어올 질문 키워드. 한국어 위주지만 영어 질문도 자주 들어와 함께 둔다.
  keywords: RegExp
  format: (data: Record<string, unknown>) => string[]
  maxItems?: number
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
    keywords: /프로젝트|포트폴리오|만든|만들|개발한|작업|서비스|앱|사이트|project|portfolio|built|made|プロジェクト|作った|開発|サービス|项目|做过|开发|作品/i,
    format: (d) =>
      listOf(d, 'items').map((p) =>
        [line(p.title), line(p.description), names(p.tags)].filter(Boolean).join(' — '),
      ),
  },
  {
    doc: 'timeline',
    key: 'items',
    heading: '연표·경력',
    keywords: /경력|이력|언제|타임라인|연표|history|career|timeline|when|경험|해왔|살아온|어디서 자|고향|経歴|学歴|いつ|经历|履历|什么时候/i,
    format: (d) =>
      listOf(d, 'items').map((t) =>
        [line(t.year), line(t.title), line(t.description)].filter(Boolean).join(' — '),
      ),
  },
  {
    doc: 'certifications',
    key: 'items',
    heading: '자격증',
    keywords: /자격증|자격|취득|certificat|license|시험|資格|資格証|资格证|证书/i,
    format: (d) =>
      listOf(d, 'items').map((c) =>
        [line(c.name), line(c.issuer), line(c.date)].filter(Boolean).join(' — '),
      ),
  },
  {
    doc: 'education',
    key: 'items',
    heading: '학력',
    keywords: /학력|학교|대학|전공|학과|학부|졸업|재학|수업|education|school|university|major|大学|学校|専攻|学歴|学部|学科|专业|学历/i,
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
    keywords: /기술|스택|언어|프레임워크|다룰|할 줄|쓸 줄|skill|stack|tech|language|技術|スタック|言語|技能|技术|语言/i,
    format: (d) =>
      listOf(d, 'categories').map((c) => `${line(c.name)}: ${names(c.items)}`),
  },
  {
    doc: 'personalInfo',
    key: 'items',
    heading: '신상 정보',
    keywords: /mbti|생일|생년|나이|몇 살|혈액형|키가|별자리|지역|사는|사세|birthday|age|height|blood|誕生日|年齢|身長|血液型|星座|住んで|生日|年龄|身高|血型|住在/i,
    format: (d) => listOf(d, 'items').map((i) => `${line(i.label)}: ${line(i.value)}`),
  },
  {
    doc: 'hobbies',
    key: 'categories',
    heading: '취미·좋아하는 것',
    keywords: /취미|좋아하|즐기|쉴 때|주말|hobby|like|enjoy|음식|먹|food|운동|게임|趣味|好きな|食べ物|爱好|喜欢|食物/i,
    format: (d) => listOf(d, 'categories').map((c) => `${line(c.name)}: ${names(c.items)}`),
  },
  {
    doc: 'routine',
    key: 'items',
    heading: '하루 루틴',
    keywords: /루틴|하루|일과|아침|저녁|습관|몇 시|routine|daily|schedule|ルーティン|一日|習慣|日常|作息/i,
    format: (d) =>
      listOf(d, 'items').map((r) => [line(r.time), line(r.content)].filter(Boolean).join(' ')),
  },
  {
    doc: 'goals',
    key: 'items',
    heading: '목표',
    keywords: /목표|꿈|계획|앞으로|장래|goal|dream|plan|future|目標|夢|将来|目标|梦想/i,
    format: (d) => listOf(d, 'items').map((g) => line(g.content)),
  },
  {
    doc: 'testimonials',
    key: 'items',
    heading: '주변 평가·외주 후기',
    keywords: /평가|평판|주변|동료|어떤 사람|추천|후기|고객|외주|testimonial|reputation|client|評価|評判|评价|口碑/i,
    format: (d) =>
      listOf(d, 'items').map((t) =>
        [line(t.name), line(t.role)].filter(Boolean).join('/') + `: ${line(t.content)}`,
      ),
  },
  {
    doc: 'values',
    key: 'items',
    heading: '가치관',
    keywords: /가치관|신념|중요하게|철학|원칙|value|belief|principle|価値観|信念|价值观/i,
    format: (d) => listOf(d, 'items').map((v) => line(v.content)),
  },
]

interface CacheEntry {
  sections: Map<string, string>
  summary: string
}

let cached: CacheEntry | null = null
let cacheExpiry = 0
let loadPromise: Promise<CacheEntry | null> | null = null

async function loadAll(): Promise<CacheEntry | null> {
  if (!adminDb) return null
  try {
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

    const entry: CacheEntry = { sections, summary }
    cached = entry
    cacheExpiry = Date.now() + TTL
    return entry
  } catch (err) {
    console.error('Portfolio context load error:', err)
    // 실패 시 직전 값을 짧게 유지해 장애 중 Firestore를 계속 두드리지 않는다.
    cacheExpiry = Date.now() + ERROR_TTL
    return cached
  } finally {
    loadPromise = null
  }
}

async function getCache(): Promise<CacheEntry | null> {
  if (cached && Date.now() < cacheExpiry) return cached
  if (loadPromise) return loadPromise
  loadPromise = loadAll()
  return loadPromise
}

/**
 * 질문과 관련된 포트폴리오 섹션만 골라 컨텍스트 문자열로 반환한다.
 * 소개(summary)는 "누구세요" 류 질문의 기본 답이라 항상 포함한다.
 */
export async function getPortfolioContext(query: string): Promise<string> {
  const entry = await getCache()
  if (!entry) return ''

  const matched = SECTIONS.filter(
    (s) => s.keywords.test(query) && entry.sections.has(s.doc),
  ).map((s) => entry.sections.get(s.doc)!)

  const parts = [entry.summary && `## 소개\n${entry.summary}`, ...matched].filter(Boolean)
  return parts.length > 0 ? parts.join('\n\n') : ''
}

export function invalidatePortfolioContext(): void {
  cached = null
  cacheExpiry = 0
  loadPromise = null
}
