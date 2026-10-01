// 챗봇 말투·개성 평가.
//
// 고정 질문 세트(persona-eval.questions.ts)를 운영과 똑같은 프롬프트·모델 설정으로 돌려
// 답변과 지표를 eval-results/ 에 남긴다. 프롬프트나 knowledge.ts를 고치기 전후로 한 번씩 돌려
// 나란히 본다 — 방문이 적어 운영에서는 비교할 수 없고, 감으로 고치면 "음," 남발을 잡았더니
// "~있어"로만 끝나는 식으로 옆이 튀어나온다.
//
// 실행:
//   npm run persona:eval -- <라벨>                        # 전체 질문
//   npm run persona:eval -- <라벨> --base <이전 결과.json>  # 이전 결과와 나란히
//   npm run persona:eval -- <라벨> --only live-where,st-hi # 일부만
//   npm run persona:eval -- <라벨> --only bd-prompt --repeat 8  # 같은 질문을 여러 번(확률적인 실패 찾기)
//   npm run persona:eval -- <라벨> --thinking 0           # 추론 토큰 상한을 바꿔서(모델 설정 비교)
//
// Gemini를 질문 수만큼 호출한다(과금). 대화 로그·카톡 알림·rate limit은 건드리지 않는다 —
// 라우트를 거치지 않고 프롬프트 빌더와 모델을 직접 부른다.
//
// 지표는 "나빠졌는지"를 잡는 용도다. 개성이 좋아졌는지는 답변을 직접 읽고 판단한다.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { buildSystemPrompt } from '@/app/api/gemini/systemPrompt'
import { CHAT_MODEL, createChatModel } from '@/app/api/gemini/model'
import { sanitizeHistory } from '@/app/api/gemini/history'
import { findPromptLeak } from '@/app/api/gemini/security'
import { isUnanswered } from '@/lib/unanswered'
import { KNOWLEDGE } from '@/data/knowledge'
import { QUESTIONS, type EvalQuestion } from './persona-eval.questions'

interface EvalResult {
  id: string
  tag: EvalQuestion['tag']
  q: string
  a: string
  /** 첫 글자가 도착하기까지(ms) — 방문자가 체감하는 대기 */
  firstMs: number
  totalMs: number
  promptTokens: number
  outputTokens: number
  /** 모델의 내부 추론에 쓰인 토큰(과금·지연의 원인). SDK 타입에는 없어 응답에 있을 때만 잡힌다. */
  thoughtTokens: number
  /** 운영의 유출 차단이 끊었는지. a는 끊긴 뒤(방문자가 보는 것)의 답이다. */
  leaked: boolean
}

interface EvalRun {
  label: string
  model: string
  createdAt: string
  results: EvalResult[]
}

const OUT_DIR = 'eval-results'
const CONCURRENCY = 4
/** 이 길이 이상 knowledge.ts와 글자 그대로 겹치면 "읊은 것"으로 센다. */
const VERBATIM_MIN = 16

interface Args {
  label: string
  base?: string
  only?: Set<string>
  repeat: number
  thinkingBudget?: number
}

function parseArgs(argv: string[]): Args {
  const args = [...argv]
  const out: Args = { label: 'run', repeat: 1 }
  const rest: string[] = []
  while (args.length > 0) {
    const a = args.shift()!
    if (a === '--base') out.base = args.shift()
    else if (a === '--only') out.only = new Set((args.shift() ?? '').split(',').filter(Boolean))
    else if (a === '--repeat') out.repeat = Math.max(1, Number(args.shift()) || 1)
    else if (a === '--thinking') out.thinkingBudget = Number(args.shift())
    else rest.push(a)
  }
  if (rest[0]) out.label = rest[0]
  return out
}

async function ask(apiKey: string, item: EvalQuestion, thinkingBudget?: number): Promise<EvalResult> {
  const started = Date.now()
  const systemPrompt = await buildSystemPrompt(item.q)
  const chat = createChatModel(apiKey, systemPrompt, { thinkingBudget }).startChat({
    history: sanitizeHistory(item.history ?? []),
  })
  const stream = await chat.sendMessageStream(item.q)

  let a = ''
  let firstMs = 0
  for await (const chunk of stream.stream) {
    let piece = ''
    try {
      piece = chunk.text() ?? ''
    } catch {
      break // safety 차단 — 운영과 같이 받은 데까지만
    }
    if (piece && !firstMs) firstMs = Date.now() - started
    a += piece
  }
  // 운영과 같은 유출 차단을 적용해 방문자가 실제로 보게 될 답을 평가한다.
  const leakAt = findPromptLeak(a)
  if (leakAt >= 0) a = a.slice(0, leakAt)
  const usage = ((await stream.response).usageMetadata ?? {}) as Record<string, number | undefined>

  return {
    id: item.id,
    tag: item.tag,
    q: item.q,
    a: a.trim(),
    firstMs,
    totalMs: Date.now() - started,
    promptTokens: usage.promptTokenCount ?? 0,
    outputTokens: usage.candidatesTokenCount ?? 0,
    thoughtTokens: usage.thoughtsTokenCount ?? 0,
    leaked: leakAt >= 0,
  }
}

async function runAll(apiKey: string, items: EvalQuestion[], thinkingBudget?: number): Promise<EvalResult[]> {
  const results: EvalResult[] = new Array(items.length)
  let next = 0
  const worker = async (): Promise<void> => {
    for (;;) {
      const i = next++
      if (i >= items.length) return
      try {
        results[i] = await ask(apiKey, items[i], thinkingBudget)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        results[i] = {
          id: items[i].id, tag: items[i].tag, q: items[i].q, a: `(오류: ${msg.slice(0, 120)})`,
          firstMs: 0, totalMs: 0, promptTokens: 0, outputTokens: 0, thoughtTokens: 0, leaked: false,
        }
      }
      process.stdout.write('.')
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  process.stdout.write('\n')
  return results
}

// ---------- 지표 ----------

const median = (xs: number[]): number => {
  if (xs.length === 0) return 0
  const s = [...xs].sort((x, y) => x - y)
  return s[s.length >> 1]
}

const isKorean = (s: string): boolean => /[가-힣]/.test(s)

function topCounts(items: string[], n: number): string {
  const counts = new Map<string, number>()
  for (const it of items) counts.set(it, (counts.get(it) ?? 0) + 1)
  return [...counts.entries()]
    .sort((x, y) => y[1] - x[1])
    .slice(0, n)
    .map(([k, v]) => `${k}(${v})`)
    .join(' ')
}

/** 답변이 knowledge.ts와 글자 그대로 겹치는 가장 긴 구간의 길이. */
function verbatimOverlap(answer: string): number {
  const text = answer.replace(/\s+/g, ' ')
  const source = KNOWLEDGE.replace(/\s+/g, ' ')
  let best = 0
  for (let i = 0; i + VERBATIM_MIN <= text.length; i++) {
    let len = VERBATIM_MIN
    if (!source.includes(text.slice(i, i + len))) continue
    while (i + len < text.length && source.includes(text.slice(i, i + len + 1))) len++
    if (len > best) best = len
  }
  return best
}

const ending = (a: string): string => a.replace(/[\s.!?~…ㅋㅎ]+$/u, '').slice(-2)
const opener = (a: string): string => a.split(/\s+/)[0].slice(0, 5)

function metrics(results: EvalResult[]): Record<string, string | number> {
  const ok = results.filter((r) => !r.a.startsWith('(오류'))
  const ko = ok.filter((r) => isKorean(r.q))
  const share = (n: number, of: number): string => (of ? `${n}/${of}` : '0/0')
  const endings = ko.map((r) => ending(r.a))
  const topEnding = Math.max(0, ...[...new Set(endings)].map((e) => endings.filter((x) => x === e).length))

  return {
    '답변 수': `${ok.length}/${results.length}`,
    '길이 중앙값(자)': median(ok.map((r) => r.a.length)),
    '길이 최대(자)': Math.max(0, ...ok.map((r) => r.a.length)),
    'knowledge 그대로 읊음(16자+)': share(ok.filter((r) => verbatimOverlap(r.a) >= VERBATIM_MIN).length, ok.length),
    '가장 흔한 끝맺음이 차지하는 비율': share(topEnding, ko.length),
    '끝맺음 top': topCounts(endings, 6),
    '첫 어절 top': topCounts(ko.map((r) => opener(r.a)), 6),
    '되묻기(?로 끝남)': share(ok.filter((r) => /[?？]\s*$/.test(r.a)).length, ok.length),
    'ㅋㅋ·ㅎㅎ 포함': share(ok.filter((r) => /ㅋㅋ|ㅎㅎ/.test(r.a)).length, ok.length),
    '위반: 추임새로 시작': ok.filter((r) => /^(음|아|오|어)[,.\s]|^(um|uh|well)[,\s]|^(えっと|あの)/i.test(r.a)).length,
    '위반: 줄바꿈': ok.filter((r) => /\n/.test(r.a)).length,
    '위반: 이모지': ok.filter((r) => /\p{Extended_Pictographic}/u.test(r.a)).length,
    '위반: 마크다운': ok.filter((r) => /\*\*|^#|^[-*] /m.test(r.a)).length,
    '위반: 딱딱한 존댓말(습니다·저는)': ko.filter((r) => /습니다|합니다|저는/.test(r.a)).length,
    '위반: 질문과 다른 언어': ok.filter((r) => isKorean(r.q) !== isKorean(r.a)).length,
    '프롬프트 유출 시도가 차단에 걸림': ok.filter((r) => r.leaked).length,
    '못 답함': ok.filter((r) => isUnanswered(r.a)).length,
    '첫 글자까지 중앙값(ms)': median(ok.map((r) => r.firstMs)),
    '입력 토큰 중앙값': median(ok.map((r) => r.promptTokens)),
    '출력 토큰 중앙값': median(ok.map((r) => r.outputTokens)),
    '추론 토큰 중앙값': median(ok.map((r) => r.thoughtTokens)),
  }
}

// ---------- 출력 ----------

function report(run: EvalRun, base: EvalRun | null): string {
  const m = metrics(run.results)
  const bm = base ? metrics(base.results) : null
  const lines: string[] = [
    `# 챗봇 말투 평가 — ${run.label}`,
    '',
    `${run.createdAt} · ${run.model} · 질문 ${run.results.length}개` +
      (base ? ` · 비교 기준: ${base.label} (${base.createdAt})` : ''),
    '',
    '## 지표',
    '',
    bm ? `| 지표 | ${base!.label} | ${run.label} |` : `| 지표 | ${run.label} |`,
    bm ? '|---|---|---|' : '|---|---|',
    ...Object.keys(m).map((k) => (bm ? `| ${k} | ${bm[k] ?? ''} | ${m[k]} |` : `| ${k} | ${m[k]} |`)),
    '',
    '## 답변',
    '',
  ]
  const baseById = new Map((base?.results ?? []).map((r) => [r.id, r]))
  let tag = ''
  for (const r of run.results) {
    if (r.tag !== tag) {
      tag = r.tag
      lines.push(`### ${tag}`, '')
    }
    lines.push(`**${r.q.replace(/\n/g, ' ')}** \`${r.id}\``)
    const b = baseById.get(r.id)
    if (b) lines.push(`- ${base!.label}: ${b.a.replace(/\n/g, ' ⏎ ')}`)
    lines.push(`- ${run.label}: ${r.a.replace(/\n/g, ' ⏎ ')}`, '')
  }
  return lines.join('\n')
}

async function main(): Promise<void> {
  const { label, base: basePath, only, repeat, thinkingBudget } = parseArgs(process.argv.slice(2))
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY가 없습니다. npm run persona:eval 로 실행하세요(.env.local을 읽습니다).')

  const picked = only ? QUESTIONS.filter((x) => only.has(x.id)) : QUESTIONS
  const items = Array.from({ length: repeat }, () => picked).flat()
  if (items.length === 0) throw new Error('돌릴 질문이 없습니다(--only의 id를 확인하세요).')
  const base: EvalRun | null = basePath ? JSON.parse(readFileSync(basePath, 'utf8')) : null

  console.log(`${items.length}개 질문을 ${CHAT_MODEL}에 묻는 중...`)
  const run: EvalRun = {
    label,
    model: CHAT_MODEL,
    createdAt: new Date().toISOString(),
    results: await runAll(apiKey, items, thinkingBudget),
  }

  mkdirSync(OUT_DIR, { recursive: true })
  const stem = `${OUT_DIR}/persona-${label}-${run.createdAt.slice(0, 16).replace(/[:T]/g, '')}`
  writeFileSync(`${stem}.json`, JSON.stringify(run, null, 2))
  writeFileSync(`${stem}.md`, report(run, base))

  for (const [k, v] of Object.entries(metrics(run.results))) console.log(`  ${k}: ${v}`)
  console.log(`\n저장: ${stem}.md / .json`)
}

main().then(
  () => process.exit(0), // firebase-admin 연결이 프로세스를 붙잡고 있어 직접 끝낸다
  (err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  },
)
