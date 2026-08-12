// 오늘 날짜와 나이를 서버가 계산해 넘긴다.
//
// 왜: 모델에는 "오늘"이 없다. 날짜를 주지 않으면 학습 시점을 기준으로 추측하는데,
// 실제로 "2002년 11월생이니까 스물한 살이야"라고 두 살이나 틀리게 답했다.
// 나이·경과 기간은 계산해서 먹여야 하고, 모델이 직접 세게 두면 안 된다.

// 생년월일은 Firestore personalInfo에도 있지만, 계산에는 흔들리지 않는 단일 상수를 쓴다.
const BIRTH_YEAR = 2002;
const BIRTH_MONTH = 11; // 1-based
const BIRTH_DAY = 7;

const TIME_ZONE = 'Asia/Seoul';
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

interface SeoulDate {
  year: number;
  month: number;
  day: number;
  weekday: number;
}

// 서버는 UTC로 도는데 기준은 한국 시간이다. 날짜가 하루 어긋나면 나이도 어긋난다.
function seoulToday(now: Date): SeoulDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string): number =>
    Number(parts.find((p) => p.type === type)?.value ?? '0');

  const year = get('year');
  const month = get('month');
  const day = get('day');
  // UTC 기준으로 만든 Date의 요일은 달력상 요일과 같다(시각 성분이 없으므로).
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return { year, month, day, weekday };
}

function koreanAge(today: SeoulDate): number {
  let age = today.year - BIRTH_YEAR;
  const beforeBirthday =
    today.month < BIRTH_MONTH || (today.month === BIRTH_MONTH && today.day < BIRTH_DAY);
  if (beforeBirthday) age -= 1;
  return age;
}

export function getDateContext(now: Date = new Date()): string {
  const today = seoulToday(now);
  const pad = (n: number): string => String(n).padStart(2, '0');
  const dateStr = `${today.year}년 ${today.month}월 ${today.day}일 (${WEEKDAYS[today.weekday]}요일)`;
  const iso = `${today.year}-${pad(today.month)}-${pad(today.day)}`;
  const age = koreanAge(today);

  return [
    `오늘 날짜: ${dateStr} / ${iso} (한국 시간 기준)`,
    `내 만 나이: ${age}세 (${BIRTH_YEAR}년 ${BIRTH_MONTH}월 ${BIRTH_DAY}일생)`,
    '나이나 날짜 계산은 직접 하지 말고 위 값을 그대로 써.',
  ].join('\n');
}
