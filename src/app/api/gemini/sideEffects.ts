import { after } from 'next/server'
import { sendQuestionAnswer } from '@/lib/webhook'
import { saveChatLog } from '@/lib/chatLog'
import { isUnanswered } from '@/lib/unanswered'
import { notifyChat } from '@/lib/kakao-notify'

function logSideEffect(context: string, err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err)
  console.error(`[${context}] ${msg}`)
}

/**
 * 대화 로그·웹훅·카톡 알림을 응답 뒤에 실행한다.
 *
 * after()로 예약해야 한다 — await 없이 던져 두기만 하면 서버리스 함수가 응답 종료와 함께
 * 멈춰 로그와 알림이 간헐적으로 사라진다. reply는 스트리밍 응답처럼 나중에 정해지는
 * 경우를 위해 Promise도 받는다.
 */
export function fireSideEffects(
  message: string,
  reply: string | Promise<string>,
  userInfo: Record<string, unknown> | null,
): void {
  after(async () => {
    const answer = await reply
    // 지어내지 않고 "모른다"고 답한 질문 = 채워 넣어야 할 지식. 표시해서 수집으로 넘긴다.
    const unanswered = isUnanswered(answer)

    await Promise.all([
      saveChatLog(message, answer, userInfo ?? undefined, unanswered).catch((err) =>
        logSideEffect('ChatLog', err),
      ),
      sendQuestionAnswer(
        message,
        answer,
        userInfo ? JSON.stringify(userInfo) : undefined,
      ).catch((err) => logSideEffect('Webhook', err)),
      notifyChat(message, answer, unanswered).catch((err) => logSideEffect('Kakao', err)),
    ])
  })
}
