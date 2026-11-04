import type { Mistake, Slot } from './types';

// LLM 키가 없을 때 가상 기기가 쓰는 대본과 규칙. 키가 있어도 퀴즈 채점·복습 간격은 여기서 한다 —
// 정답 판정과 날짜 계산은 모델에게 맡기지 않는다(같은 저장소 챗봇의 원칙과 같다).

/** 맞힌 횟수(box)별 다음 복습까지 일수. 틀리면 box 0으로 돌아가 다음 날 다시 묻는다. */
export const REVIEW_GAPS = [1, 2, 4, 7] as const;

export function nextDue(box: number, today: number): number {
  return today + REVIEW_GAPS[Math.min(Math.max(box, 0), REVIEW_GAPS.length - 1)];
}

/** 처음 들어온 사람에게 넣어 두는 "어제의 실수" — 하루 예시의 07:30 장면과 같다. */
export function sampleMemory(): Mistake[] {
  return [
    {
      id: 'sample-running-late',
      wrong: "I'm late running",
      right: "I'm running late",
      ko: '나 늦을 것 같아',
      hint: 'run late = 늦어지다',
      addedDay: 0,
      box: 0,
      dueDay: 1,
      hits: 0,
      sample: true,
    },
  ];
}

/** 한국어 화자가 자주 하는 실수 몇 가지. 대본 모드의 "틀린 표현 찾기"는 이 목록뿐이다. */
interface Pattern {
  re: RegExp;
  right: string;
  /** 짧은 한국어 뜻 — 퀴즈에서 "이걸 영어로?"로 묻는다. 비우면 "고쳐 말해 봐"로 묻는다 */
  ko: string;
  /** 왜 틀렸는지 한 줄 */
  hint: string;
  /** right가 비었을 때: 잡은 동사(1번 그룹) → 고친 동사 */
  fix?: Record<string, string>;
}

const PATTERNS: Pattern[] = [
  { re: /\bI(?:'m| am) late running\b/i, right: "I'm running late", ko: '나 늦을 것 같아', hint: 'run late = 늦어지다' },
  { re: /\bI(?:'m| am) boring\b/i, right: "I'm bored", ko: '나 지루해', hint: 'boring은 남을 지루하게 하는 쪽' },
  { re: /\bI(?:'m| am) exciting\b/i, right: "I'm excited", ko: '나 신나', hint: 'exciting은 신나게 하는 쪽' },
  { re: /\bI(?:'m| am) interesting in\b/i, right: "I'm interested in", ko: '~에 관심 있어', hint: '관심 있는 쪽은 interested' },
  { re: /\bI(?:'m| am) agree\b/i, right: 'I agree', ko: '동의해', hint: 'agree는 동사라 am이 필요 없다' },
  { re: /\bdiscuss about\b/i, right: 'discuss', ko: '~에 대해 이야기하다', hint: 'discuss 뒤엔 about을 쓰지 않는다' },
  { re: /\bexplain me\b/i, right: 'explain to me', ko: '나한테 설명해 줘', hint: 'explain 뒤 사람 앞엔 to' },
  { re: /\bmore better\b/i, right: 'better', ko: '더 나은', hint: 'better에 이미 "더"가 들어 있다' },
  { re: /\bpeople is\b/i, right: 'people are', ko: '사람들은 ~이다', hint: 'people은 복수' },
  { re: /\b(?:he|she|it) (go|do|have|like|want)\b/i, right: '', ko: '', hint: '3인칭 단수 현재엔 -s', fix: { go: 'goes', do: 'does', have: 'has', like: 'likes', want: 'wants' } },
  { re: /\byesterday,? I (go|eat|meet|see|watch)\b/i, right: '', ko: '', hint: '어제 일은 과거형', fix: { go: 'went', eat: 'ate', meet: 'met', see: 'saw', watch: 'watched' } },
  { re: /\bI didn't (went|ate|saw|did)\b/i, right: '', ko: '', hint: "didn't 뒤엔 동사 원형", fix: { went: 'go', ate: 'eat', saw: 'see', did: 'do' } },
  { re: /\bmake (?:a |my )?homework\b/i, right: 'do my homework', ko: '숙제하다', hint: '숙제는 do' },
  { re: /\bcontact to\b/i, right: 'contact', ko: '~에게 연락하다', hint: 'contact 뒤엔 to를 쓰지 않는다' },
  { re: /\bmarry with\b/i, right: 'marry', ko: '~와 결혼하다', hint: 'marry 뒤엔 with를 쓰지 않는다' },
];

/** 복습 질문. 뜻이 있으면 "영어로 어떻게 말해?", 문법 실수면 "고쳐 말해 봐". */
export function quizQuestion(m: Pick<Mistake, 'ko' | 'wrong'>): string {
  return m.ko ? `How do you say "${m.ko}" in English?` : `Can you fix this? "${m.wrong}"`;
}

/** 사용자 문장에서 틀린 표현을 찾는다(최대 2개). */
export function findMistakes(text: string): Pick<Mistake, 'wrong' | 'right' | 'ko' | 'hint'>[] {
  const found: Pick<Mistake, 'wrong' | 'right' | 'ko' | 'hint'>[] = [];
  for (const p of PATTERNS) {
    const m = text.match(p.re);
    if (!m) continue;
    const wrong = m[0];
    let right = p.right;
    if (!right && p.fix && m[1]) {
      // 잡은 동사는 항상 매치의 끝에 있다 — 끝부분만 바꿔 앞의 같은 글자를 건드리지 않는다.
      const to = p.fix[m[1].toLowerCase()];
      if (to) right = wrong.slice(0, wrong.length - m[1].length) + to;
    }
    if (right) found.push({ wrong, right, ko: p.ko, hint: p.hint });
    if (found.length >= 2) break;
  }
  return found;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/\bi am\b/g, "i'm")
    .replace(/\bdo not\b/g, "don't")
    .replace(/\bdid not\b/g, "didn't")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 퀴즈 답이 맞았는지. 정답 표현이 답 안에 들어 있으면 맞은 것으로 본다. */
export function isCorrect(answer: string, right: string): boolean {
  const a = ` ${normalize(answer)} `;
  const r = normalize(right);
  return r.length > 0 && a.includes(` ${r} `);
}

export const INTERESTS = [
  { id: 'coding', label: '개발' },
  { id: 'soccer', label: '축구' },
  { id: 'cooking', label: '요리' },
] as const;
export type InterestId = (typeof INTERESTS)[number]['id'];

/** 점심 브리핑 — 실제 기기는 2분 분량, 데모는 짧게. 쉬운 영어(대략 A2~B1). */
const BRIEFINGS: Record<InterestId, string> = {
  coding:
    'Here is your lunch briefing. Many developers now write code together with AI tools. But people still need to read and check the code. What do you check first when you read code?',
  soccer:
    'Here is your lunch briefing. In soccer, a team usually has eleven players on the field. Teams often change their plan at half-time. What is your favorite team?',
  cooking:
    'Here is your lunch briefing. Many people in small homes cook simple meals in one pan. It saves time and dishes. What did you eat for lunch today?',
};

export function openingLine(slot: Slot, interest: InterestId, quiz: Mistake | null): string {
  if (quiz) {
    const when = slot === 'morning' ? 'Good morning!' : slot === 'night' ? 'Before bed, a quick review.' : 'Quick one.';
    return `${when} ${quizQuestion(quiz)}`;
  }
  switch (slot) {
    case 'morning':
      return "Good morning! What's your plan for today?";
    case 'noon':
      return BRIEFINGS[interest];
    case 'evening':
      return 'Hey, welcome back. How was your day?';
    case 'night':
      return 'No mistakes to review tonight. Nice work today. Good night!';
  }
}

const FOLLOW_UPS = [
  'Oh, nice. Can you tell me a little more?',
  'I see. How did that make you feel?',
  'Sounds good. What are you going to do next?',
];

/** 대본 모드의 대화 답. 틀린 표현이 있으면 한 줄로 고쳐 주고, 없으면 다음 질문으로. */
export function scriptedReply(turnIndex: number, mistakes: Pick<Mistake, 'wrong' | 'right'>[]): string {
  const tip = mistakes[0] ? `Small tip: say "${mistakes[0].right}" instead of "${mistakes[0].wrong}". I'll ask you again tomorrow. ` : '';
  return tip + FOLLOW_UPS[turnIndex % FOLLOW_UPS.length];
}

/** 한 세션에서 대화를 몇 번 주고받고 끝낼지. 기기는 짧게 끝낸다(귀찮음 대응). */
export const MAX_CHAT_TURNS = 3;

export function closingLine(saved: number): string {
  return saved > 0
    ? `Thanks for chatting! I saved ${saved} expression${saved > 1 ? 's' : ''} to review later.`
    : 'Thanks for chatting! Talk to you later.';
}
