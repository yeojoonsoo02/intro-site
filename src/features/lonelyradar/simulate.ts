import { DAY_MIN, type DayPlan, type Noise, type RadarMinute, type ScenarioId, type SimConfig, type SimResult, type TruthState } from './types';

// 원룸 한 칸, 혼자 사는 사람 한 명의 생활을 1분 단위로 만들고, 레이더 키트가 내보낼 법한 값으로 바꾼다.
// - 평일: 7시쯤 일어나 8시쯤 나가고 19시쯤 들어와 23시 40분쯤 잔다. 주말: 9시쯤 일어나고 오후에 나갈 때가 많다.
// - 집에 있는 동안은 움직임(설거지·청소)과 쉼(앉아 있기·졸기·바닥에 눕기)이 번갈아 온다.
// - 키트는 원신호가 아니라 결과값(재실·움직임 세기·호흡수·쓰러짐 표시)을 1분마다 준다고 가정한다.
// 수치(시각·길이·검출 확률)는 데모용 가정이다. 실제 값은 실거주 시험에서 다시 맞춘다.

export interface Scenario {
  id: ScenarioId;
  label: string;
  kind: '정상' | '헛경보 유발' | '응급' | '느린 변화';
  summary: string;
}

export const FALL_DAY = 18;
export const DECLINE_DAY = 14;
export const OVERSLEEP_DAYS = [16, 19, 23, 26, 30, 33, 37, 40];
export const AWAY_DAYS = [17, 18, 19];

export const SCENARIOS: Scenario[] = [
  { id: 'normal', label: '정상 생활', kind: '정상', summary: '평일 출근, 주말엔 늦잠과 오후 외출. 알림이 거의 없어야 한다.' },
  {
    id: 'oversleep',
    label: '늦잠',
    kind: '헛경보 유발',
    summary: `${OVERSLEEP_DAYS[0] + 1}일째부터 며칠에 한 번 평소보다 2시간 반~3시간 늦게 일어난다. 자는 중이라 호흡은 잡힌다.`,
  },
  {
    id: 'longAway',
    label: '장기 외출',
    kind: '헛경보 유발',
    summary: `${AWAY_DAYS[0] + 1}일째 오전에 나가 ${AWAY_DAYS[2] + 1}일째 저녁에 돌아온다(2박 3일). 집에 없으니 알릴 일이 아니다.`,
  },
  {
    id: 'fall',
    label: '쓰러진 뒤 무활동',
    kind: '응급',
    summary: `${FALL_DAY + 1}일째 밤 9시쯤 방에서 쓰러진다. 잠깐 버둥거린 뒤 바닥에서 움직이지 못한다. 침대 밖이라 호흡은 거의 안 잡힌다.`,
  },
  {
    id: 'decline',
    label: '서서히 활동 감소',
    kind: '느린 변화',
    summary: `${DECLINE_DAY + 1}일째부터 3주에 걸쳐 움직이는 시간이 절반 가까이 줄고, 늦게 일어나고, 덜 나간다.`,
  },
];

export function scenarioById(id: ScenarioId): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}

// ---------- 난수 ----------

/** 시드가 같으면 같은 수열 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mix(a: number, b: number): number {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35);
  h ^= h >>> 13;
  h = Math.imul(h, 0x27d4eb2f);
  return (h ^ (h >>> 16)) >>> 0;
}

interface Rng {
  u: () => number;
  n: (mean: number, sd: number) => number;
  range: (lo: number, hi: number) => number;
  chance: (p: number) => boolean;
}

function rng(seed: number): Rng {
  const u = mulberry32(seed);
  return {
    u,
    n: (mean, sd) => mean + sd * Math.sqrt(-2 * Math.log(Math.max(u(), 1e-12))) * Math.cos(2 * Math.PI * u()),
    range: (lo, hi) => lo + (hi - lo) * u(),
    chance: (p) => u() < p,
  };
}

// ---------- 하루 계획 ----------

/** 분 단위 "무엇을 하고 있나" 코드. 알고리즘은 보지 않는다. */
const K = { out: 0, active: 1, rest: 2, doze: 3, floorRest: 4, sleep: 5, sleepBlocked: 6, fallen: 7 } as const;
type Kind = (typeof K)[keyof typeof K];

const TRUTH: Record<Kind, TruthState> = {
  [K.out]: 'away',
  [K.active]: 'active',
  [K.rest]: 'rest',
  [K.doze]: 'rest',
  [K.floorRest]: 'rest',
  [K.sleep]: 'sleep',
  [K.sleepBlocked]: 'sleep',
  [K.fallen]: 'fallen',
};

/** 활동 감소 시나리오: 그날 활동 배율(1 → 약 0.45) */
function declineFactor(scenario: ScenarioId, day: number): number {
  if (scenario !== 'decline' || day < DECLINE_DAY) return 1;
  return 1 - 0.55 * Math.min(1, (day - DECLINE_DAY) / 21);
}

function planDay(cfg: SimConfig, day: number): DayPlan {
  const r = rng(mix(cfg.seed, day * 2 + 1));
  const dow = day % 7; // 0=월
  const weekend = dow >= 5;
  const f = declineFactor(cfg.scenario, day);
  let wake = weekend ? r.n(540, 35) : r.n(420, 15);
  wake += (1 - f) * 110; // 활동이 줄면 늦게 일어난다
  if (cfg.scenario === 'oversleep' && OVERSLEEP_DAYS.includes(day)) wake += r.range(150, 200);
  // 금·토요일 밤은 늦게 잔다
  const bed = dow === 4 || dow === 5 ? r.n(1470, 30) : r.n(1420, 25);
  const outings: { from: number; to: number }[] = [];
  if (!weekend) {
    if (r.chance(0.92 * f + (1 - f) * 0.4)) {
      const leave = wake + Math.max(25, r.n(55, 8));
      outings.push({ from: leave, to: Math.max(leave + 240, r.n(1140, 40)) });
    }
    if (r.chance(0.3 * f) && !(cfg.scenario === 'fall' && day === FALL_DAY)) {
      const from = r.n(1290, 25);
      outings.push({ from, to: from + r.range(15, 35) });
    }
  } else if (r.chance(0.65 * f)) {
    const from = Math.max(wake + 60, r.n(780, 60));
    outings.push({ from, to: from + r.range(180, 360) });
  }
  return {
    day,
    weekend,
    wake: Math.round(wake),
    bed: Math.round(bed),
    outings: outings.map((o) => ({ from: Math.round(o.from), to: Math.round(o.to) })).filter((o) => o.from > wake + 10 && o.to < bed - 20),
  };
}

function fill(kind: Uint8Array, from: number, to: number, k: Kind): void {
  const a = Math.max(0, Math.floor(from));
  const b = Math.min(kind.length, Math.floor(to));
  for (let i = a; i < b; i++) kind[i] = k;
}

/** 집에서 깨어 있는 시간: 움직임과 쉼이 번갈아 온다 */
function fillAwake(kind: Uint8Array, from: number, to: number, r: Rng, f: number): void {
  let t = from;
  const morning = r.range(15, 35);
  fill(kind, t, Math.min(to, t + morning), K.active);
  t += morning;
  while (t < to) {
    const act = r.range(8, 45) * f;
    fill(kind, t, Math.min(to, t + act), K.active);
    t += act;
    if (t >= to) break;
    const x = r.u();
    if (x < 0.015) {
      // 바닥에 누워 쉼 — 천장 센서가 쓰러짐으로 볼 수 있다
      const len = r.range(10, 40);
      fill(kind, t, Math.min(to, t + len), K.floorRest);
      t += len;
    } else if (x < 0.015 + 0.12 + (1 - f) * 0.3) {
      const len = r.range(25, 70) / Math.sqrt(f);
      fill(kind, t, Math.min(to, t + len), K.doze);
      t += len;
    } else {
      const len = r.range(15, 70) / f;
      fill(kind, t, Math.min(to, t + len), K.rest);
      t += len;
    }
  }
}

/** 잠: 1~2시간 덩어리마다 가끔 자세 때문에 호흡이 잘 안 잡히고, 밤중에 화장실을 다녀오기도 한다 */
function fillSleep(kind: Uint8Array, from: number, to: number, r: Rng): void {
  let t = from;
  while (t < to) {
    const len = r.range(60, 120);
    fill(kind, t, Math.min(to, t + len), r.chance(0.15) ? K.sleepBlocked : K.sleep);
    t += len;
  }
  if (to - from > 300 && r.chance(0.4)) {
    const at = from + (to - from) * r.range(0.35, 0.65);
    fill(kind, at, at + r.range(3, 6), K.active);
  }
}

interface NoiseLevel {
  presenceMiss: number;
  ghost: number;
  breathRest: number;
  breathSleep: number;
}

const NOISE: Record<Noise, NoiseLevel> = {
  low: { presenceMiss: 0.01, ghost: 0.001, breathRest: 0.2, breathSleep: 0.96 },
  normal: { presenceMiss: 0.03, ghost: 0.003, breathRest: 0.15, breathSleep: 0.93 },
  high: { presenceMiss: 0.07, ghost: 0.01, breathRest: 0.08, breathSleep: 0.85 },
};

/** 시뮬레이션 전체를 만든다. 같은 설정이면 같은 결과다. */
export function simulate(cfg: SimConfig): SimResult {
  const total = cfg.days * DAY_MIN;
  const kind = new Uint8Array(total);
  const plans: DayPlan[] = [];
  for (let d = 0; d <= cfg.days; d++) plans.push(planDay(cfg, d));

  // 0일째는 자고 있는 상태로 시작한다
  fillSleep(kind, 0, plans[0].wake, rng(mix(cfg.seed, 7)));
  for (let d = 0; d < cfg.days; d++) {
    const p = plans[d];
    const r = rng(mix(cfg.seed, d * 2 + 2));
    const base = d * DAY_MIN;
    const f = declineFactor(cfg.scenario, d);
    fillAwake(kind, base + p.wake, base + p.bed, r, f);
    for (const o of p.outings) fill(kind, base + o.from, base + o.to, K.out);
    fillSleep(kind, base + p.bed, (d + 1) * DAY_MIN + plans[d + 1].wake, r);
  }

  let emergencyT: number | null = null;
  let trickyDays: number[] = [];
  if (cfg.scenario === 'longAway') {
    const [a, , c] = AWAY_DAYS;
    if (c < cfg.days) {
      fill(kind, a * DAY_MIN + 600, c * DAY_MIN + 1080, K.out);
      trickyDays = [...AWAY_DAYS];
    }
  }
  if (cfg.scenario === 'oversleep') trickyDays = OVERSLEEP_DAYS.filter((d) => d < cfg.days);
  if (cfg.scenario === 'fall') {
    const day = Math.min(FALL_DAY, cfg.days - 2);
    const r = rng(mix(cfg.seed, 99));
    let t = day * DAY_MIN + Math.round(r.n(1260, 20));
    // 집에서 깨어 있을 때 쓰러진다
    while (t < total - 60 && kind[t] !== K.active && kind[t] !== K.rest) t++;
    emergencyT = t;
    fill(kind, t, total, K.fallen);
  }
  const slowOnsetDay = cfg.scenario === 'decline' ? DECLINE_DAY : null;

  // 1분마다 키트가 내보낼 값
  const nz = NOISE[cfg.noise];
  const minutes: RadarMinute[] = new Array(total);
  const truth: TruthState[] = new Array(total);
  const r = rng(mix(cfg.seed, 12345));
  for (let i = 0; i < total; i++) {
    const k = kind[i] as Kind;
    truth[i] = TRUTH[k];
    let presence = true;
    let motion = 0;
    let breath: number | null = null;
    let fall = false;
    const bpm = (): number => Math.round(r.n(14, 1.5) * 10) / 10;
    switch (k) {
      case K.out:
        presence = r.chance(nz.ghost); // 커튼·선풍기 같은 헛것
        motion = presence ? r.range(5, 20) : 0;
        break;
      case K.active:
        motion = r.range(22, 85);
        break;
      case K.rest:
        presence = !r.chance(nz.presenceMiss);
        motion = r.chance(0.06) ? r.range(16, 30) : r.range(2, 13);
        if (r.chance(nz.breathRest)) breath = bpm();
        break;
      case K.doze:
        presence = !r.chance(nz.presenceMiss);
        motion = r.chance(0.02) ? r.range(16, 25) : r.range(0, 7);
        if (r.chance(nz.breathRest * 0.6)) breath = bpm();
        break;
      case K.floorRest:
        presence = !r.chance(nz.presenceMiss);
        motion = r.range(1, 10);
        if (r.chance(0.05)) breath = bpm();
        fall = cfg.fallSensor;
        break;
      case K.sleep:
      case K.sleepBlocked:
        presence = !r.chance(nz.presenceMiss / 2);
        motion = r.chance(0.03) ? r.range(16, 35) : r.range(0, 6);
        if (motion < 15 && r.chance(k === K.sleep ? nz.breathSleep : 0.15)) breath = Math.round(r.n(13, 1.2) * 10) / 10;
        break;
      case K.fallen: {
        const since = emergencyT === null ? 99 : i - emergencyT;
        presence = !r.chance(nz.presenceMiss);
        motion = since < 1 ? 90 : since < 8 ? r.range(5, 28) : r.range(0, 4);
        if (r.chance(0.04)) breath = Math.round(r.n(18, 2) * 10) / 10;
        fall = cfg.fallSensor && (since < 1 || r.chance(0.95));
        break;
      }
    }
    if (!presence) {
      motion = 0;
      breath = null;
      fall = false;
    }
    minutes[i] = { t: i, presence, motion: Math.round(motion), breath, fall };
  }

  return { config: cfg, minutes, truth, plans: plans.slice(0, cfg.days), emergencyT, slowOnsetDay, trickyDays };
}
