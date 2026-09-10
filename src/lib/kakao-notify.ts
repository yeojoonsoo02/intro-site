/**
 * 카톡 알림 릴레이 — yeojoonsoo02 앱의 /api/notify 에 기록하면
 * 챗코(에어 상주 봇)가 60초 폴링으로 카톡 발송한다.
 *
 * 환경변수:
 * - KAKAO_NOTIFY_URL: https://db.yeojoonsoo02.com/api/notify
 * - KAKAO_NOTIFY_SECRET: Bearer 토큰
 */

async function notifyKakao(params: {
  title: string
  message: string
  type?: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
}): Promise<boolean> {
  const url = process.env.KAKAO_NOTIFY_URL
  const secret = process.env.KAKAO_NOTIFY_SECRET
  if (!url || !secret) {
    console.warn('[KakaoNotify] KAKAO_NOTIFY_URL/SECRET 미설정 - 알림 미발송:', params.title)
    return false
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ source: 'intro-site', ...params }),
    })
    if (!res.ok) console.warn('[KakaoNotify] 릴레이 응답 실패:', res.status)
    return res.ok
  } catch (e) {
    console.warn('[KakaoNotify] 릴레이 요청 실패:', e)
    return false
  }
}

/** 챗봇 문답 알림 (카톡). 못 답한 질문은 눈에 띄게 구분 — 곧 채워 넣어야 할 지식 목록. */
export async function notifyChat(
  question: string,
  answer: string,
  unanswered = false,
): Promise<void> {
  const a = answer.length > 500 ? answer.slice(0, 500) + '...' : answer
  await notifyKakao({
    title: unanswered ? '❓ 소개 챗봇: 못 답한 질문' : '💬 소개 챗봇: 새 질문',
    message: `Q: ${question}\n\nA: ${a}`,
    type: unanswered ? 'WARNING' : 'INFO',
  })
}
