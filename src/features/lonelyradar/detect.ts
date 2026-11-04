import { DAY_MIN, type Baseline, type RadarMinute, type State } from './types';

// 레이더 값 → 상태. 키트가 1분마다 주는 재실·움직임 세기·호흡수·쓰러짐 표시만 본다.
//   집에 없음   : 재실이 AWAY_MIN분 넘게 연달아 없음(한두 분 끊기는 건 정적 재실을 놓친 것으로 보고 앞 상태를 이어 간다)
//   쓰러짐      : 천장 센서의 쓰러짐·바닥 점유 표시
//   움직임      : 움직임 세기 ACTIVE 이상
//   정지 + 호흡 : 가만히 있고, 최근 BREATH_WIN분 안에 호흡이 잡힘 → 자는 중이거나 쉬는 중
//   정지 + 호흡 미검출 : 가만히 있는데 호흡도 안 잡힘 → 침대 밖에서 오래 가만히 있거나, 더 나쁜 경우

export const ACTIVE = 15;
export const AWAY_MIN = 5;
export const BREATH_WIN = 10;

export const STATE_LABEL: Record<State, string> = {
  away: '집에 없음',
  active: '움직임',
  resting: '정지 + 호흡(자거나 쉼)',
  stillNoBreath: '정지 + 호흡 미검출',
  fallen: '쓰러짐 표시',
};

/** 분마다 상태를 정한다. */
export function classify(minutes: RadarMinute[]): State[] {
  const out: State[] = new Array(minutes.length);
  let absentRun = 0;
  let lastBreath = -Infinity;
  let prev: State = 'resting';
  for (let i = 0; i < minutes.length; i++) {
    const m = minutes[i];
    if (m.breath !== null) lastBreath = i;
    let s: State;
    if (!m.presence) {
      absentRun++;
      if (absentRun >= AWAY_MIN) {
        s = 'away';
        // 앞의 몇 분도 사실은 나간 것이었다
        for (let j = i - AWAY_MIN + 1; j < i; j++) if (j >= 0) out[j] = 'away';
      } else s = prev === 'away' ? 'away' : prev;
    } else {
      absentRun = 0;
      if (m.fall) s = 'fallen';
      else if (m.motion >= ACTIVE) s = 'active';
      else s = i - lastBreath <= BREATH_WIN ? 'resting' : 'stillNoBreath';
    }
    out[i] = s;
    prev = s;
  }
  return out;
}

/** 그날 하루 요약 — 기준선을 만들 때와 활동 추세를 볼 때 쓴다 */
export interface DayStats {
  day: number;
  /** 일어난 시각: 04시 뒤 처음으로 30분 안에 8분 넘게 움직인 때(밤중 화장실은 걸러진다) */
  wake: number | null;
  /** 잠든 시각: 20시~다음 날 04시 사이, 2시간 동안 거의 움직이지 않은 구간이 시작된 때 */
  bed: number | null;
  /** 집에 있던 분 */
  presentMin: number;
  /** 움직인 분 */
  activeMin: number;
  /** 깨어 있는 동안 가장 길게 가만히 있던 분 */
  maxStill: number;
  /** 시간대별 집에 없었나 */
  awayHours: boolean[];
}

export const WAKE_FROM = 240;
export const WAKE_WIN = 30;
export const WAKE_ACTIVE = 8;

export function dayStats(states: State[], day: number): DayStats {
  const base = day * DAY_MIN;
  const at = (m: number): State | undefined => states[base + m];
  let wake: number | null = null;
  if (at(WAKE_FROM) !== undefined) {
    let cnt = 0;
    for (let m = WAKE_FROM; m < 900 && at(m) !== undefined; m++) {
      if (at(m) === 'active') cnt++;
      if (m - WAKE_WIN >= WAKE_FROM && at(m - WAKE_WIN) === 'active') cnt--;
      if (cnt >= WAKE_ACTIVE) {
        // 창 안에서 처음 움직인 분
        let first = m - WAKE_WIN + 1;
        while (first < m && at(first) !== 'active') first++;
        wake = Math.max(WAKE_FROM, first);
        break;
      }
      if (at(m) === 'away' && m < 600) {
        // 아침에 이미 나갔다 — 기상 시각을 모른다
        break;
      }
    }
  }
  let bed: number | null = null;
  for (let m = 1200; m < DAY_MIN + 240; m += 5) {
    if (at(m) === undefined || at(m + 120) === undefined) break;
    let act = 0;
    let away = 0;
    for (let k = m; k < m + 120; k++) {
      const s = at(k);
      if (s === 'active') act++;
      if (s === 'away') away++;
    }
    if (act <= 10 && away <= 10) {
      bed = m;
      break;
    }
  }
  let presentMin = 0;
  let activeMin = 0;
  let maxStill = 0;
  let run = 0;
  const awayHours = new Array<boolean>(24).fill(false);
  const awakeFrom = wake ?? 600;
  const awakeTo = bed ?? 1380;
  for (let m = 0; m < DAY_MIN; m++) {
    const s = at(m);
    if (s === undefined) break;
    if (s === 'away') {
      awayHours[Math.floor(m / 60)] = true;
      run = 0;
      continue;
    }
    presentMin++;
    if (s === 'active') {
      activeMin++;
      run = 0;
    } else if (m >= awakeFrom && m < awakeTo) {
      run++;
      if (run > maxStill) maxStill = run;
    }
  }
  return { day, wake, bed, presentMin, activeMin, maxStill, awayHours };
}

/** 하루 활동 비율 = 집에 있던 시간 중 움직인 비율. 집에 6시간도 없던 날은 null(외박·여행) */
export function activeShare(s: DayStats): number | null {
  return s.presentMin < 360 ? null : s.activeMin / s.presentMin;
}

function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export const isWeekend = (day: number): boolean => day % 7 >= 5;
export const isWeekendNight = (day: number): boolean => day % 7 === 4 || day % 7 === 5;

/** 처음 baselineDays일로 그 사람의 평소를 만든다. 다른 사람 평균이 아니라 자기 자신과 비교한다. */
export function buildBaseline(states: State[], baselineDays: number): Baseline {
  const stats: DayStats[] = [];
  for (let d = 0; d < baselineDays && (d + 1) * DAY_MIN <= states.length; d++) stats.push(dayStats(states, d));
  // 기상은 토·일 아침, 잠은 금·토 밤이 주말이다
  const pick = (weekend: boolean, key: 'wake' | 'bed'): number | null =>
    median(stats.filter((s) => (key === 'wake' ? isWeekend(s.day) : isWeekendNight(s.day)) === weekend && s[key] !== null).map((s) => s[key] as number));
  const shares = stats.map(activeShare).filter((v): v is number => v !== null);
  const mean = shares.length ? shares.reduce((a, b) => a + b, 0) / shares.length : 0;
  const sd = shares.length > 1 ? Math.sqrt(shares.reduce((a, b) => a + (b - mean) ** 2, 0) / (shares.length - 1)) : 0;
  const awayShare = Array.from({ length: 24 }, (_, h) => (stats.length ? stats.filter((s) => s.awayHours[h]).length / stats.length : 0));
  return {
    days: stats.length,
    wake: { weekday: pick(false, 'wake'), weekend: pick(true, 'wake') },
    bed: { weekday: pick(false, 'bed'), weekend: pick(true, 'bed') },
    activeShare: { mean, sd },
    maxStill: Math.max(30, ...stats.map((s) => s.maxStill)),
    awayShare,
  };
}

/** 그날의 평소 기상 시각(평일·주말 중 하나가 아직 없으면 다른 쪽) */
export function expectedWake(b: Baseline, day: number): number | null {
  return isWeekend(day) ? (b.wake.weekend ?? b.wake.weekday) : (b.wake.weekday ?? b.wake.weekend);
}

export function expectedBed(b: Baseline, day: number): number {
  // 그날 밤에 자는 시각: 금·토요일 밤은 주말 값
  return (isWeekendNight(day) ? (b.bed.weekend ?? b.bed.weekday) : (b.bed.weekday ?? b.bed.weekend)) ?? 1400;
}
