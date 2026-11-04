// 영어 룸메이트 데모가 쓰는 타입. 클라이언트(가상 기기)와 서버 라우트(/api/roommate)가 같이 쓴다.

export type Slot = 'morning' | 'noon' | 'evening' | 'night';

export const SLOTS: readonly Slot[] = ['morning', 'noon', 'evening', 'night'];

export const SLOT_LABEL: Record<Slot, { name: string; time: string }> = {
  morning: { name: '아침', time: '07:30' },
  noon: { name: '점심', time: '12:00' },
  evening: { name: '저녁', time: '19:00' },
  night: { name: '밤', time: '22:00' },
};

/** 틀린 표현 하나. 기억 목록의 한 줄이고, 며칠 뒤 다시 묻는 단위다. */
export interface Mistake {
  id: string;
  /** 사용자가 실제로 한 말(틀린 부분) */
  wrong: string;
  /** 고친 표현 — 복습 퀴즈의 정답 */
  right: string;
  /** 짧은 한국어 뜻 — 퀴즈에서 "이걸 영어로?"로 묻는다. 빈 문자열이면 "고쳐 말해 봐"로 묻는다 */
  ko: string;
  /** 왜 틀렸는지 한 줄(대본 모드에서만 채움) */
  hint?: string;
  /** 기록한 날(시뮬레이션 일차) */
  addedDay: number;
  /** 0~3. 맞힐수록 올라가고 간격이 길어진다(1·2·4·7일) */
  box: number;
  /** 다음 복습 일차 */
  dueDay: number;
  /** 지금까지 맞힌 횟수 */
  hits: number;
  /** 시작할 때 넣어 둔 예시인지 */
  sample?: boolean;
}

export interface Turn {
  who: 'device' | 'me';
  text: string;
}

/** /api/roommate 응답 */
export interface RoommateReply {
  reply: string;
  mistakes: Pick<Mistake, 'wrong' | 'right' | 'ko'>[];
}
