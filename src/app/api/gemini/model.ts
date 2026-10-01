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
