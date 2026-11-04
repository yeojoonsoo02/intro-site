// "하루를 따라가는 스토리" 페이지의 글. 사실·숫자·상태 표시는 옛 설명 페이지(2026-11 이전)의 것을 그대로 옮겼다 — 새로 지어내지 않는다.
// 장면 속 영어 대사는 웹 데모(script.ts·RoommateDemo)가 실제로 하는 말을 따랐다.

export type Line =
  | { who: 'device'; text: string; lang?: 'en' }
  | { who: 'me'; text: string; lang?: 'en' }
  /** 기기·센서 쪽에서 일어난 일(가운데 작은 글씨) */
  | { who: 'note'; text: string }
  /** 학습자가 누른 버튼 */
  | { who: 'press'; text: string };

export interface SceneData {
  id: string;
  /** 큰 시각. 시각이 없는 장면은 "언제든" */
  time: string;
  /** 아침·점심 같은 때 이름(작게) */
  part: string;
  title: string;
  /** 이 장면이 보여 주는 기술 한 줄 */
  tech: string;
  body: string;
  lines: Line[];
  /** 본문 아래 작은 한 줄(이 장면과 관련된 숫자와 출처) */
  aside?: string;
  /** 장면마다 시각·배치를 다르게 둔다 */
  layout: 'photoRight' | 'compact' | 'word' | 'mirror' | 'center';
  photo?: { src: string; alt: string; position?: string };
  tone: 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';
}

export const SCENES: SceneData[] = [
  {
    id: 't0730',
    time: '07:30',
    part: '아침',
    title: '방에 있으면, 기기가 먼저 인사한다',
    tech: '먼저 말 걸기 · 레이더 + 폰 BLE 근접',
    body: '폰이 기기의 BLE 비콘 영역에 들어오면 서버에 알리고, 기기는 레이더로 정말 방에 있는지 확인한다. 둘 다 맞으면 기기가 먼저 말을 건다. 폰은 “누구”, 레이더는 “정말 있는지”를 맡는다. 인사에는 어제 틀린 “I’m running late”를 넣어 한 번 말해 보게 한다.',
    lines: [
      { who: 'note', text: '폰 근접 · 들어옴 → 레이더 · 방에 있음' },
      { who: 'device', lang: 'en', text: 'Good morning! How do you say “나 늦을 것 같아” in English?' },
      { who: 'me', lang: 'en', text: 'I’m running late.' },
      { who: 'device', lang: 'en', text: 'Exactly! “I’m running late.” So, what’s your plan for today?' },
    ],
    aside: '비교할 신호는 4가지다 — 정해진 시간 · 레이더 · 폰 근접 · 폰+레이더 (연구 질문 2 · 계획).',
    layout: 'photoRight',
    photo: {
      src: '/portfolio/capstone/roommate-hero.webp',
      alt: '아침빛이 드는 작은 원룸. 책상 위 둥근 기기의 윗면 링이 주황빛으로 켜져 있고, 뒤로 정리 안 된 침대와 의자에 걸린 후드티가 보인다.',
      position: '52% 50%',
    },
    tone: 'morning',
  },
  {
    id: 't1200',
    time: '12:00',
    part: '점심',
    title: '2분, 내 관심사로 만든 쉬운 영어',
    tech: '맞춤 듣기 입력 · 관심사·수준·지난 실수',
    body: '모두에게 같은 교재 대신, 내 관심사·수준·지난 실수로 만든 짧은 영어 브리핑을 들려준다. 관심사 하나를 쉬운 영어로 2분.',
    lines: [
      { who: 'note', text: '점심 브리핑 · 2분 · 관심사: 개발' },
      {
        who: 'device',
        lang: 'en',
        text: 'Here is your lunch briefing. Many developers now write code together with AI tools. But people still need to read and check the code. What do you check first when you read code?',
      },
      { who: 'me', lang: 'en', text: 'I check the tests first.' },
    ],
    layout: 'compact',
    tone: 'noon',
  },
  {
    id: 'anytime',
    time: '언제든',
    part: '바쁠 때',
    title: '“나중에”를 누르면 조용해진다',
    tech: '말 걸 때 배우기 · 하루 상한 · 거절한 시간대',
    body: '미루면 조용해지고, 언제 말 걸어야 하는지를 배운다. 하루 말 거는 횟수에 상한을 두고, 거절한 시간대에는 덜 말 건다. 마이크는 버튼을 누르거나 기기가 물어본 뒤에만 켜진다.',
    lines: [
      { who: 'device', lang: 'en', text: 'Quick one. Ready for some English?' },
      { who: 'press', text: '나중에' },
      { who: 'note', text: '“나중에” — 잠시 뒤 다시 말을 겁니다.' },
      { who: 'note', text: '같은 시간대에 “나중에”가 쌓이면, 그 시간대엔 먼저 말 걸지 않습니다.' },
    ],
    layout: 'word',
    tone: 'afternoon',
  },
  {
    id: 't1900',
    time: '19:00',
    part: '저녁',
    title: '“How was your day?” — 3분 대화',
    tech: '대화 + 틀린 표현 기록 · 클라우드 LLM',
    body: '저녁엔 3분 대화를 건다. 대화에서 틀린 표현은 기억에 모아 둔다. 받아쓰기·음성 합성은 기기나 브라우저에서 할 수 있는 만큼 하고, 대화 문장만 LLM API로 보낸다.',
    lines: [
      { who: 'device', lang: 'en', text: 'Hey, welcome back. How was your day?' },
      { who: 'me', lang: 'en', text: 'Good! Yesterday I go to a new cafe.' },
      {
        who: 'device',
        lang: 'en',
        text: 'Small tip: say “Yesterday I went” instead of “Yesterday I go”. I’ll ask you again tomorrow. Oh, nice. Can you tell me a little more?',
      },
      { who: 'note', text: '기억에 추가: “Yesterday I go” → “Yesterday I went”' },
    ],
    aside:
      '로컬 음성 파이프라인(받아쓰기 → gemma4 → Kokoro) 평균 응답 1.1초 — 맥 시제품 · 합성 음성으로 잰 값. 대화 API 비용은 학생 1명이 한 달 3시간쯤 쓸 때 약 200원 — 추정 · Claude Haiku 5.5 가격 기준.',
    layout: 'mirror',
    tone: 'evening',
  },
  {
    id: 't2200',
    time: '22:00',
    part: '밤',
    title: '자기 전 1분, 오늘 틀린 표현 복습',
    tech: '간격 반복 · 틀린 표현을 며칠 뒤 다시',
    body: '오늘 틀린 표현 3개를 다시 묻는다. 핵심 기술은 기억이다 — 틀린 표현을 모아 두고, 며칠 간격을 늘려 가며 기기가 먼저 다시 묻는다. 폰 앱에서는 틀린 표현이 그날로 끝난다.',
    lines: [
      { who: 'note', text: '복습 1 / 3' },
      { who: 'device', lang: 'en', text: 'Before bed, a quick review. Can you fix this? “Yesterday I go”' },
      { who: 'me', lang: 'en', text: 'Yesterday I went.' },
      { who: 'device', lang: 'en', text: 'Exactly! “Yesterday I went.” Next one…' },
    ],
    photo: {
      src: '/portfolio/english-roommate/room-night.webp',
      alt: '밤의 같은 원룸. 불은 꺼져 있고 창으로 푸른 빛이 들며, 책상 위 둥근 기기의 링만 주황빛으로 은은하게 켜져 있다.',
      position: '50% 55%',
    },
    layout: 'center',
    tone: 'night',
  },
];

/** 웹 데모의 복습 간격(script.ts REVIEW_GAPS와 같다). 맞히면 다음 칸으로, 틀리면 다음 날 다시. */
export const REVIEW_STEPS = ['1일', '2일', '4일', '7일'];
