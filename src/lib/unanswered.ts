// 챗봇이 "모른다"고 답한 질문을 골라낸다.
//
// 왜: 정보에 없는 걸 지어내지 않게 막으면, 대신 "모른다" 답변이 늘어난다.
// 그 질문들이야말로 지식으로 채워 넣어야 할 목록이므로, 표시해서 텔레그램
// 수집 경로(/questions → /answer → /sync)로 넘긴다.

// 시스템 프롬프트가 지시한 거절·회피 표현들. 표현이 바뀌면 여기도 함께 손볼 것.
const UNKNOWN_PATTERNS = [
  /잘 모르겠/,
  /나도 모르/,
  /그건 나도 잘/,
  /기억이 안 나/,
  /기억이 잘 안/,
  /알아올게/,
  /대답하기 어렵/,
  /말하기 좀 그렇/,
  /곤란한데/,
  /생각해본 적 없/,
  /안 해봤/,
  /잘 몰라/,
  /don'?t know/i,
  /not sure/i,
  /わからな/,
  /知らない/,
  /不知道/,
]

export function isUnanswered(answer: string): boolean {
  const text = answer.trim()
  if (!text) return true
  return UNKNOWN_PATTERNS.some((p) => p.test(text))
}
