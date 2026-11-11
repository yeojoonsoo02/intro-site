import Anthropic from '@anthropic-ai/sdk'
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  type GenerationConfig,
  type GenerativeModel,
} from '@google/generative-ai'

// 챗봇이 쓰는 모델과 설정. 라우트와 평가 스크립트(scripts/persona-eval.ts)가 같이 쓴다 —
// 따로 두면 평가는 통과했는데 운영은 다른 설정으로 도는 일이 생긴다.
export const CHAT_MODEL = 'gemini-2.5-flash'

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
]

export interface ChatModelOptions {
  /**
   * 답하기 전 모델의 내부 추론에 쓸 토큰 상한. 0이면 추론 없음, -1이면 모델이 알아서(API 기본값).
   * 지정하지 않으면 DEFAULT_THINKING_BUDGET.
   */
  thinkingBudget?: number
}

// 운영 기본값. 바꾸려면 `npm run persona:eval -- <라벨> --thinking <값>`으로 먼저 비교한다.
//
// 2026-10 실험(위험 질문 6개 × 6회): 0이면 첫 글자까지 0.8초로 빠르지만 금지한 추임새가
// 36번 중 6번, 없는 일화를 지어낸 답도 나왔다. 512는 추임새 2번·지어낸 일화 0번에 2.8초,
// 1024는 비슷한 품질에 최악 지연만 길었다(6.3초 vs 4.9초). 자동(-1)은 같은 질문에도 추론을
// 하다 말다 해서 결과가 들쭉날쭉했다. "지어내지 않는다"가 이 챗봇의 첫 번째 규칙이라 512로 둔다.
export const DEFAULT_THINKING_BUDGET = 512

// 답은 1~3문장이라 수백 토큰이면 충분하다. 상한이 없으면 프롬프트를 통째로 뱉게 하는 공격이
// 성공했을 때 1만 자가 그대로 나간다(2026-10 평가에서 실제 발생). 추론 토큰도 이 안에 든다.
const MAX_OUTPUT_TOKENS = 2048

export function createChatModel(
  apiKey: string,
  systemPrompt: string,
  options: ChatModelOptions = {},
): GenerativeModel {
  const thinkingBudget = options.thinkingBudget ?? DEFAULT_THINKING_BUDGET
  // thinkingConfig는 이 SDK 버전(0.24)의 타입에 없지만 요청 본문에는 그대로 실려 간다.
  const generationConfig = {
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    thinkingConfig: { thinkingBudget },
  } as GenerationConfig

  return new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: CHAT_MODEL,
    systemInstruction: systemPrompt,
    safetySettings: SAFETY_SETTINGS,
    generationConfig,
  })
}

// ── Claude ───────────────────────────────────────────────────────────────
// 2026-11-11 사용자 결정: 챗봇 답은 Claude 로. ANTHROPIC_API_KEY 가 있으면 Claude, 없으면 위의 Gemini.
// (검색용 임베딩은 Claude 에 임베딩 모델이 없어 Gemini 그대로 — lib/embeddings.ts)
export const CLAUDE_CHAT_MODEL = 'claude-opus-5-5'

// 답은 1~3문장. 짧은 대화라 생각 깊이는 low — 더 올리려면 persona:eval 로 먼저 비교한다.
const CLAUDE_EFFORT = 'low' as const
// Gemini 의 MAX_OUTPUT_TOKENS 와 같은 뜻(프롬프트를 통째로 뱉게 하는 공격 대비). Claude 는 생각 토큰도 여기에 들어가 넉넉히.
const CLAUDE_MAX_TOKENS = 4096

export type ChatProvider = 'claude' | 'gemini'

/** 지금 쓸 모델. 둘 다 없으면 null (라우트가 외부 대체 서비스로 넘긴다). */
export function chatProvider(): ChatProvider | null {
  if (process.env.ANTHROPIC_API_KEY) return 'claude'
  if (process.env.GEMINI_API_KEY) return 'gemini'
  return null
}

export function chatModelName(provider: ChatProvider): string {
  return provider === 'claude' ? CLAUDE_CHAT_MODEL : CHAT_MODEL
}

export interface ChatUsage {
  promptTokens: number
  outputTokens: number
  thoughtTokens: number
}

export interface ChatStream {
  /** 답 글 조각. 안전 차단·거절이면 그때까지 받은 데서 끝난다. */
  pieces: AsyncIterable<string>
  usage(): Promise<ChatUsage>
}

interface ChatTurn {
  role: 'user' | 'model'
  parts: { text: string }[]
}

let anthropic: Anthropic | null = null

/** 라우트와 평가 스크립트가 같이 쓰는 입구 — 모델이 달라도 같은 모양으로 글 조각을 준다. */
export async function startChatStream(
  provider: ChatProvider,
  systemPrompt: string,
  history: ChatTurn[],
  message: string,
  options: ChatModelOptions = {},
): Promise<ChatStream> {
  if (provider === 'claude') return startClaudeStream(systemPrompt, history, message)
  return startGeminiStream(systemPrompt, history, message, options)
}

async function startGeminiStream(
  systemPrompt: string,
  history: ChatTurn[],
  message: string,
  options: ChatModelOptions,
): Promise<ChatStream> {
  const chat = createChatModel(process.env.GEMINI_API_KEY ?? '', systemPrompt, options).startChat({ history })
  const stream = await chat.sendMessageStream(message)
  async function* pieces() {
    for await (const chunk of stream.stream) {
      let piece = ''
      try {
        piece = chunk.text() ?? ''
      } catch (chunkErr) {
        // safety 차단 시 text()가 던진다 — 받은 데까지만
        console.warn('Gemini chunk blocked:', chunkErr instanceof Error ? chunkErr.message : chunkErr)
        return
      }
      if (piece) yield piece
    }
  }
  return {
    pieces: pieces(),
    async usage() {
      const u = ((await stream.response).usageMetadata ?? {}) as Record<string, number | undefined>
      return {
        promptTokens: u.promptTokenCount ?? 0,
        outputTokens: u.candidatesTokenCount ?? 0,
        thoughtTokens: u.thoughtsTokenCount ?? 0,
      }
    },
  }
}

async function startClaudeStream(systemPrompt: string, history: ChatTurn[], message: string): Promise<ChatStream> {
  if (!anthropic) anthropic = new Anthropic()
  const messages: Anthropic.Beta.BetaMessageParam[] = history.map((turn) => ({
    role: turn.role === 'model' ? 'assistant' : 'user',
    content: turn.parts.map((p) => p.text).join('\n'),
  }))
  messages.push({ role: 'user', content: message })
  const stream = anthropic.beta.messages.stream({
    model: CLAUDE_CHAT_MODEL,
    max_tokens: CLAUDE_MAX_TOKENS,
    output_config: { effort: CLAUDE_EFFORT },
    // 안전 분류기가 거절하면 서버가 기본 대체 모델로 다시 돌린다
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: systemPrompt,
    messages,
  })
  async function* pieces() {
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta' && event.delta.text) {
        yield event.delta.text
      }
    }
  }
  return {
    pieces: pieces(),
    async usage() {
      const final = await stream.finalMessage()
      return {
        promptTokens: final.usage.input_tokens + (final.usage.cache_read_input_tokens ?? 0),
        outputTokens: final.usage.output_tokens,
        thoughtTokens: 0, // Claude 는 생각 토큰을 output_tokens 에 합쳐 센다
      }
    },
  }
}
