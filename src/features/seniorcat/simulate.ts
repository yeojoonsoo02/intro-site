import { DAY_S, type CatConfig, type CatId, type Elim, type Maintenance, type Sample, type ScenarioId, type SimConfig, type SimDay, type TrueVisit } from './types';

// 로드셀 시뮬레이터. 화장실 밑 저울이 실제로 내보낼 법한 무게 신호를 날마다 만든다.
// - 저울 값 = 모래(+ 아직 치우지 않은 소변·대변 덩어리) + 올라와 있는 고양이 + 잡음
// - 고양이가 안에서 소변을 봐도 저울 위의 총무게는 그대로다(고양이 → 모래로 옮겨 갈 뿐).
//   그래서 배설량은 "나온 뒤 모래 − 들어가기 전 모래"로만 알 수 있다.
// - 기기는 변화가 없으면 10분에 한 번, 무게가 움직이면 앞뒤 30초를 포함해 1초에 한 번 값을 올린다고 가정한다.
// 수치(소변 횟수·양, 머문 시간, 체중 흔들림)는 데모용 가정이다. 실제 값은 자원 가구 데이터로 맞춘다.

export interface Scenario {
  id: ScenarioId;
  label: string;
  speed: '정상' | '느린 변화' | '급한 변화' | '구분 어려움';
  summary: string;
  cats: CatConfig[];
  /** 변화가 생기는 고양이(cats의 순번). 고양이 수가 줄면 마지막 고양이로 */
  target: number | null;
  /** 변화가 시작되는 날(급한 변화는 그날 07시) */
  onsetDay: number | null;
}

const TWO: CatConfig[] = [
  { id: 'A', name: '보리', weightG: 3600, male: false },
  { id: 'B', name: '두부', weightG: 4400, male: true },
];
const THREE: CatConfig[] = [
  { id: 'A', name: '보리', weightG: 3600, male: false },
  { id: 'B', name: '두부', weightG: 4200, male: true },
  { id: 'C', name: '콩이', weightG: 4400, male: false },
];

export const ONSET_SLOW = 30;
export const ONSET_URGENT = 35;
/** 급한 변화 시나리오에서 소변이 막힌 시간(07시부터 이만큼). 이후는 병원 치료를 받았다고 가정 */
const URGENT_HOURS = 30;

export const SCENARIOS: Scenario[] = [
  { id: 'normal', label: '정상', speed: '정상', summary: '두 마리 모두 평소대로 지낸다. 알림이 없어야 정상이다.', cats: TWO, target: null, onsetDay: null },
  {
    id: 'polyuria',
    label: '소변 증가',
    speed: '느린 변화',
    summary: `${ONSET_SLOW}일째부터 보리(3.6kg)의 소변 횟수가 3주에 걸쳐 약 50%, 한 번 양이 약 25% 늘어난다.`,
    cats: TWO,
    target: 0,
    onsetDay: ONSET_SLOW,
  },
  {
    id: 'weightLoss',
    label: '체중 감소',
    speed: '느린 변화',
    summary: `${ONSET_SLOW}일째부터 보리의 체중이 5주에 걸쳐 약 8% 준다(3.6kg → 약 3.3kg).`,
    cats: TWO,
    target: 0,
    onsetDay: ONSET_SLOW,
  },
  {
    id: 'noUrine',
    label: '소변 안 나옴 의심',
    speed: '급한 변화',
    summary: `${ONSET_URGENT}일째 아침 7시부터 두부(수컷 4.4kg)가 화장실을 자주 들락거리지만 모래 무게가 거의 늘지 않는다.`,
    cats: TWO,
    target: 1,
    onsetDay: ONSET_URGENT,
  },
  {
    id: 'similar',
    label: '다묘 체중 비슷함',
    speed: '구분 어려움',
    summary: `세 마리(3.6·4.2·4.4kg). 4.2kg와 4.4kg가 비슷하고, ${ONSET_SLOW}일째부터 콩이(4.4kg)의 소변이 는다.`,
    cats: THREE,
    target: 2,
    onsetDay: ONSET_SLOW,
  },
];

export function scenarioById(id: ScenarioId): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}

export function targetCat(config: SimConfig): CatId | null {
  const sc = scenarioById(config.scenario);
  if (sc.target === null || config.cats.length === 0) return null;
  return config.cats[Math.min(sc.target, config.cats.length - 1)].id;
}

// ---------- 난수 ----------

/** 시드가 같으면 같은 수열 — 날마다 따로 시드를 줘서 하루를 더 만들어도 앞날이 바뀌지 않는다 */
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

function mix(a: number, b: number): number {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35);
  h ^= h >>> 13;
  h = Math.imul(h, 0x27d4eb2f);
  return (h ^ (h >>> 16)) >>> 0;
}

interface Rng {
  u: () => number;
  n: (mean?: number, sd?: number) => number;
  range: (lo: number, hi: number) => number;
  poisson: (lambda: number) => number;
}

function rng(seed: number): Rng {
  const u = mulberry32(seed);
  const n = (mean = 0, sd = 1): number => {
    const a = Math.max(u(), 1e-12);
    return mean + sd * Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * u());
  };
  return {
    u,
    n,
    range: (lo, hi) => lo + (hi - lo) * u(),
    poisson: (lambda) => {
      const L = Math.exp(-lambda);
      let k = 0;
      let p = 1;
      do {
        k += 1;
        p *= u();
      } while (p > L);
      return k - 1;
    },
  };
}

// ---------- 고양이 한 마리의 하루 ----------

/** 고양이마다 다른 버릇(머문 시간·소변 횟수). 등록 순번으로 정한다 */
const HABIT = [
  { stay: 70, urinations: 2.4 },
  { stay: 115, urinations: 2.8 },
  { stay: 90, urinations: 2.2 },
];

interface Plan {
  catId: CatId;
  start: number;
  elim: Elim | 'strain';
  massG: number;
  stayS: number;
  catWeightG: number;
}

const ramp = (day: number, onset: number, len: number): number => Math.min(1, Math.max(0, (day - onset) / len));

function trueWeight(config: SimConfig, idx: number, day: number): number {
  const cat = config.cats[idx];
  const sc = scenarioById(config.scenario);
  const isTarget = targetCat(config) === cat.id;
  if (sc.id === 'weightLoss' && isTarget && sc.onsetDay !== null) return cat.weightG * (1 - 0.08 * ramp(day, sc.onsetDay, 35));
  return cat.weightG;
}

/** 밤(1~6시)엔 덜 가게 시간을 뽑는다 */
function pickTime(r: Rng, day: number): number {
  for (;;) {
    const s = r.range(0, DAY_S);
    const h = s / 3600;
    if (h >= 1 && h < 6 && r.u() > 0.35) continue;
    return day * DAY_S + s;
  }
}

function planDay(config: SimConfig, day: number, r: Rng): Plan[] {
  const sc = scenarioById(config.scenario);
  const target = targetCat(config);
  const plans: Plan[] = [];

  config.cats.forEach((cat, idx) => {
    const habit = HABIT[idx % HABIT.length];
    const isTarget = cat.id === target;
    const kg = cat.weightG / 1000;
    // 하루 체중 흔들림(먹고 마신 양) ~0.8%, 방문마다 ~1.2%
    const dayWeight = trueWeight(config, idx, day) * (1 + r.n(0, 0.008));
    const weightNow = (): number => dayWeight * (1 + r.n(0, 0.012));

    let urineCountMul = 1;
    let urineMassMul = 1;
    if ((sc.id === 'polyuria' || sc.id === 'similar') && isTarget && sc.onsetDay !== null) {
      const k = ramp(day, sc.onsetDay, 21);
      urineCountMul = 1 + 0.5 * k;
      urineMassMul = 1 + 0.25 * k;
    }

    // 급한 변화: 막힌 동안엔 소변·대변 대신 "자세만 잡고 안 나오는" 방문을 자주 한다
    let blockedFrom = Infinity;
    let blockedTo = -Infinity;
    if (sc.id === 'noUrine' && isTarget && sc.onsetDay !== null) {
      blockedFrom = sc.onsetDay * DAY_S + 7 * 3600;
      blockedTo = blockedFrom + URGENT_HOURS * 3600;
      const dayStart = day * DAY_S;
      let t = Math.max(blockedFrom, dayStart) + r.range(0, 600);
      while (t < Math.min(blockedTo, dayStart + DAY_S)) {
        plans.push({ catId: cat.id, start: t, elim: 'strain', massG: Math.max(0, r.n(1, 1.2)), stayS: r.range(70, 200), catWeightG: weightNow() });
        t += r.range(25, 70) * 60;
      }
    }
    const blocked = (t: number): boolean => t >= blockedFrom && t < blockedTo;

    // 건강한 고양이는 꽤 규칙적이다: 하루 최소 두 번, 하루를 n등분한 칸마다 한 번씩(칸 안에서는 무작위)
    const nUrine = 2 + r.poisson(Math.max(0, habit.urinations * urineCountMul - 2));
    for (let i = 0; i < nUrine; i++) {
      const t = day * DAY_S + ((i + r.range(0.1, 0.9)) / nUrine) * DAY_S;
      if (blocked(t)) continue;
      plans.push({
        catId: cat.id,
        start: t,
        elim: 'urine',
        massG: Math.max(6, r.n(kg * 8 * urineMassMul, kg * 2)),
        stayS: Math.max(35, r.n(habit.stay, habit.stay * 0.2)),
        catWeightG: weightNow(),
      });
    }
    const nFeces = r.u() < 0.15 ? 0 : r.u() < 0.82 ? 1 : 2;
    for (let i = 0; i < nFeces; i++) {
      const t = pickTime(r, day);
      if (blocked(t)) continue;
      plans.push({
        catId: cat.id,
        start: t,
        elim: 'feces',
        massG: Math.max(8, r.n(kg * 5, kg * 1.3)),
        stayS: Math.max(60, r.n(habit.stay + 55, habit.stay * 0.25)),
        catWeightG: weightNow(),
      });
    }
    const nSniff = r.poisson(0.4);
    for (let i = 0; i < nSniff; i++) {
      plans.push({ catId: cat.id, start: pickTime(r, day), elim: 'none', massG: 0, stayS: r.range(12, 40), catWeightG: weightNow() });
    }
  });

  plans.sort((a, b) => a.start - b.start);
  // 두 마리가 겹치지 않게: 앞 방문이 끝나고 3분 뒤로 민다
  for (let i = 1; i < plans.length; i++) {
    const prevEnd = plans[i - 1].start + plans[i - 1].stayS;
    if (plans[i].start < prevEnd + 180) plans[i].start = prevEnd + 180 + r.range(0, 120);
  }
  return plans.filter((p) => p.start + p.stayS < (day + 1) * DAY_S - 120);
}

// ---------- 무게 신호 ----------

interface Clump {
  t: number;
  g: number;
}

export interface Simulator {
  /** 다음 하루를 만든다 */
  next: () => SimDay;
  days: SimDay[];
}

const SCOOP_AT = 21 * 3600;
const IDLE_EVERY = 600;
const PAD = 30;

export function createSimulator(config: SimConfig): Simulator {
  // 모래 상태는 날을 넘어 이어진다
  let litter = 5000;
  let clumps: Clump[] = [];
  const days: SimDay[] = [];

  /** 증발: 덩어리는 반나절에 걸쳐 수분이 빠져 최대 20% 가벼워진다 */
  const clumpMass = (c: Clump, t: number): number => (config.drift ? c.g * (1 - 0.2 * (1 - Math.exp(-(t - c.t) / 21600))) : c.g);
  /** 모래 자체의 습기 변화 — 하루 주기로 ±6g */
  const humidity = (t: number): number => (config.drift ? 6 * Math.sin((2 * Math.PI * t) / DAY_S) : 0);
  const level = (t: number): number => litter + humidity(t) + clumps.reduce((s, c) => s + (c.t <= t ? clumpMass(c, t) : 0), 0);

  function next(): SimDay {
    const day = days.length;
    const r = rng(mix(config.seed, day));
    const noise = (): number => r.n(0, config.noiseG);
    const plans = planDay(config, day, r);
    const samples: Sample[] = [];
    const truth: TrueVisit[] = [];
    const maintenance: Maintenance[] = [];
    const push = (t: number, w: number): void => {
      samples.push({ t, w: Math.round(w + noise()) });
    };

    // 하루의 사건(방문 + 21시 청소)을 시간 순으로
    type Ev = { kind: 'visit'; t: number; plan: Plan } | { kind: 'scoop'; t: number; refill: boolean };
    const evs: Ev[] = plans.map((p) => ({ kind: 'visit' as const, t: p.start, plan: p }));
    const scoopT = day * DAY_S + SCOOP_AT + r.range(-1800, 1800);
    const busy = plans.some((p) => scoopT > p.start - 300 && scoopT < p.start + p.stayS + 300);
    evs.push({ kind: 'scoop', t: busy ? scoopT + 900 : scoopT, refill: day % 7 === 6 });
    evs.sort((a, b) => a.t - b.t);

    let cursor = day * DAY_S;
    const idleUntil = (until: number): void => {
      // 마지막으로 올린 뒤 10분마다 한 번
      let t = Math.ceil(cursor / IDLE_EVERY) * IDLE_EVERY;
      if (t === cursor && samples.length > 0) t += IDLE_EVERY;
      for (; t < until; t += IDLE_EVERY) push(t, level(t));
    };

    for (const ev of evs) {
      const from = Math.floor(ev.t) - PAD;
      idleUntil(from);
      if (ev.kind === 'visit') {
        const end = visitSignal(ev.plan, Math.floor(ev.t), level, push, r);
        if (ev.plan.massG > 0.5) clumps.push({ t: end, g: ev.plan.massG });
        // 고양이가 모래를 밖으로 차내면 모래가 준다
        const scatter = r.u() < 0.3 ? r.range(2, 14) : 0;
        litter -= scatter;
        for (let t = end + 1; t <= end + PAD; t++) push(t, level(t));
        cursor = end + PAD;
        truth.push({
          catId: ev.plan.catId,
          start: Math.floor(ev.t),
          end,
          elim: ev.plan.elim === 'strain' ? 'none' : ev.plan.elim,
          massG: ev.plan.massG,
          catWeightG: ev.plan.catWeightG,
        });
      } else {
        // 청소: 손·삽이 누르는 40초, 그다음 덩어리가 빠지고(보충하는 날은 모래가 늘고) 안정
        const t0 = Math.floor(ev.t);
        for (let t = from; t < t0; t++) push(t, level(t));
        for (let t = t0; t < t0 + 40; t++) push(t, level(t) + Math.abs(r.n(150, 120)));
        clumps = [];
        litter -= r.range(10, 40); // 덩어리와 함께 떠낸 모래
        if (ev.refill) litter += r.range(600, 900);
        maintenance.push({ t: t0, kind: ev.refill ? 'refill' : 'scoop' });
        for (let t = t0 + 40; t <= t0 + 40 + PAD; t++) push(t, level(t));
        cursor = t0 + 40 + PAD;
      }
    }
    idleUntil((day + 1) * DAY_S);

    const result: SimDay = { day, samples, truth, maintenance };
    days.push(result);
    return result;
  }

  return { next, days };
}

/** 방문 하나의 1초 간격 신호. 고양이가 나간 시각을 돌려준다 */
function visitSignal(p: Plan, t0: number, level: (t: number) => number, push: (t: number, w: number) => void, r: Rng): number {
  for (let t = t0 - PAD; t < t0; t++) push(t, level(t));
  const W = p.catWeightG;
  const L = level(t0);
  // 저울 위 총무게는 고양이가 있는 동안 L + W로 유지된다(소변이 고양이에서 모래로 옮겨 갈 뿐)
  const on = (t: number, frac: number, sd: number): void => push(t, L + W * frac + r.n(0, sd));

  let t = t0;
  on(t++, 0.45, 40); // 앞발
  on(t++, 0.85, 40);

  const squat = p.elim === 'urine' ? r.range(18, 40) : p.elim === 'feces' ? r.range(35, 70) : p.elim === 'strain' ? r.range(30, 90) : 0;
  const dig = r.range(6, 14);
  const cover = p.elim === 'none' ? 0 : r.range(6, 16);
  const sniff = Math.max(0, p.stayS - 4 - dig - squat - cover);

  const moving = (len: number, sd: number): void => {
    for (let i = 0; i < len; i++) {
      // 가끔 한 발을 테두리에 올려 무게가 빠진다
      const frac = r.u() < 0.12 ? r.range(0.8, 0.93) : 1;
      on(t++, frac, sd);
    }
  };
  moving(Math.round(dig), W * 0.035);
  if (p.elim === 'urine' || p.elim === 'strain') {
    // 소변 자세: 오래 가만히 있다(막혔을 때도 자세는 잡는다)
    for (let i = 0; i < Math.round(squat); i++) on(t++, 1, 7);
  } else if (p.elim === 'feces') {
    // 대변: 짧게 멈췄다가 힘주며 몸이 흔들리기를 반복
    let left = Math.round(squat);
    while (left > 0) {
      const still = Math.min(left, Math.round(r.range(5, 11)));
      for (let i = 0; i < still; i++) on(t++, 1, 7);
      left -= still;
      const push2 = Math.min(left, Math.round(r.range(2, 4)));
      for (let i = 0; i < push2; i++) on(t++, r.range(0.92, 1.0), W * 0.03);
      left -= push2;
    }
  }
  moving(Math.round(cover), W * 0.045);
  moving(Math.round(sniff), W * 0.02);

  // 나가기
  on(t++, 0.6, 40);
  on(t++, 0.15, 30);
  return t;
}

/** n일까지 만든다(이미 만든 날은 그대로 둔다) */
export function simulateUntil(sim: Simulator, n: number): SimDay[] {
  while (sim.days.length < n) sim.next();
  return sim.days.slice(0, n);
}
