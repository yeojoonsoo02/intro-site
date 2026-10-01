import { findPromptLeak } from './security'

// 모델이 낸 답을 방문자에게 내보내기 전에 거르는 곳. 규칙(시스템 프롬프트)으로는 확률만 줄일 뿐
// 완전히 막지 못하는 두 가지를 코드로 보장한다.
//
// 1. 추임새로 시작하는 답: "음,"으로 시작하지 말라고 적어 둬도 열 번에 한 번쯤은 나온다
//    (2026-10 대화 점검: 48턴 중 6번). 맨 앞의 추임새만 떼어낸다.
// 2. 시스템 프롬프트 유출: 소제목이 보이면 그 앞에서 끊는다(security.ts의 findPromptLeak).
//
// 라우트(스트리밍)·fallback(JSON)·평가 스크립트가 같이 쓴다 — 평가가 방문자가 실제로 보는 답을 본다.

// 뒤에 쉼표·마침표·공백이 올 때만 추임새로 본다. "음악은…", "Umbrella"는 건드리지 않는다.
const LEADING_FILLER = /^\s*(?:음+|um+|uh+|えっと|あの)[,.…~、。\s]+/i
// 추임새까지만 도착하고 뒤가 아직 안 온 상태. 이때 판단하면 "음.." 뒤에 이어지는 "." 를 놓친다.
const FILLER_ONLY = /^\s*(?:음+|um+|uh+|えっと|あの)[,.…~、。\s]*$/i

/** 답변 맨 앞의 추임새("음, ", "음.. ", "Um, ", "えっと、")를 뗀다. */
export function stripLeadingFiller(text: string): string {
  const stripped = text.replace(LEADING_FILLER, '')
  if (stripped === text) return text
  // "Um, these days…"에서 떼면 소문자로 시작한다. 영어 문장은 첫 글자를 다시 세운다.
  return /^[a-z]/.test(stripped) ? stripped[0].toUpperCase() + stripped.slice(1) : stripped
}

// 첫 글자를 내보내기 전에 모아 두는 길이. 추임새인지 판단할 만큼만 — 길면 스트리밍이 늦게 시작한다.
const HEAD_HOLD = 8

export interface ReplyFilter {
  /** 모델이 보낸 조각을 넣고, 지금 방문자에게 내보낼 글을 받는다(없으면 ''). */
  push(piece: string): string
  /** 스트림이 끝났을 때 아직 내보내지 않은 글을 받는다. */
  flush(): string
  /** 지금까지 내보낸 글 전체 — 로그·알림에 남는 답. */
  readonly text: string
  /** 프롬프트 유출을 감지해 끊었는지. 끊었으면 더 넣어도 내보내지 않는다. */
  readonly leaked: boolean
}

export function createReplyFilter(): ReplyFilter {
  let raw = ''
  let sent = ''
  let headDecided = false
  let leaked = false

  const emit = (): string => {
    const clean = stripLeadingFiller(raw)
    const out = clean.slice(sent.length)
    sent = clean
    return out
  }

  return {
    push(piece) {
      if (leaked || !piece) return ''
      raw += piece
      const leakAt = findPromptLeak(raw)
      if (leakAt >= 0) {
        raw = raw.slice(0, leakAt)
        leaked = true
      }
      if (!headDecided) {
        // 유출로 끊긴 경우엔 더 올 글이 없으니 바로 판단한다.
        if (!leaked && (raw.length < HEAD_HOLD || FILLER_ONLY.test(raw))) return ''
        headDecided = true
      }
      return emit()
    },
    flush() {
      headDecided = true
      return emit()
    },
    get text() {
      return sent
    },
    get leaked() {
      return leaked
    },
  }
}

/** 한 번에 받은 답(스트리밍이 아닌 경로)을 같은 규칙으로 거른다. */
export function filterReply(reply: string): { text: string; leaked: boolean } {
  const filter = createReplyFilter()
  filter.push(reply)
  filter.flush()
  return { text: filter.text.trim(), leaked: filter.leaked }
}
