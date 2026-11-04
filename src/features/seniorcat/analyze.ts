import { detectVisits } from './detect';
import { identify } from './identify';
import { ONSET_URGENT, scenarioById, targetCat } from './simulate';
import {
  DAY_S,
  type Alert,
  type Baseline,
  type CatConfig,
  type CatId,
  type DailyRow,
  type Identified,
  type LevelShift,
  type MetricId,
  type SimConfig,
  type SimDay,
} from './types';

// 방문 목록 → 고양이별 하루 기록 → 그 고양이의 평소(기준선) → 벗어나면 알림.
// 느린 변화: 처음 N일로 기준선을 만들고, 날마다 CUSUM(누적합) 변화점 검출 + 최근 7일 평균 변화율을 함께 본다.
// 급한 변화: 시간 단위 규칙(배설 없는 방문이 몰림 · 소변이 오래 없음).
// 문턱값은 데모용 임시값이다. 실제 값은 수의사 의견과 자원 가구 데이터로 정한다.

export const METRICS: { id: MetricId; label: string; unit: string; dir: 1 | -1; minEffect: number; digits: number }[] = [
  { id: 'urinations', label: '소변 횟수', unit: '회/일', dir: 1, minEffect: 0.25, digits: 1 },
  { id: 'urineG', label: '소변 양', unit: 'g/일', dir: 1, minEffect: 0.25, digits: 0 },
  { id: 'weight', label: '체중', unit: 'kg', dir: -1, minEffect: 0.03, digits: 2 },
  { id: 'defecations', label: '대변 횟수', unit: '회/일', dir: -1, minEffect: 0.4, digits: 1 },
];

/** CUSUM: 표준화한 값에서 k를 빼며 쌓고 h를 넘으면 변화로 본다 */
export const CUSUM_K = 0.75;
export const CUSUM_H = 6;
/** 같은 지표로 다시 알리기까지 쉬는 날 */
const COOLDOWN_DAYS = 14;
/** 급한 변화 1: 이 시간 안에 */
const BURST_WINDOW_S = 6 * 3600;
/** 배설 없는 방문이 이만큼 */
const BURST_N = 4;
/** 급한 변화 2: 소변이 이만큼 없으면 */
const NO_URINE_S = 36 * 3600;

const mean = (xs: number[]): number => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const sd = (xs: number[]): number => {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
};

export function metricValue(row: DailyRow, id: MetricId): number | null {
  if (id === 'weight') return row.weight;
  return row[id];
}

export function dailyRows(visits: Identified[], cat: CatId, days: number): DailyRow[] {
  const rows: DailyRow[] = Array.from({ length: days }, (_, day) => ({ day, visits: 0, urinations: 0, urineG: 0, defecations: 0, weight: null, stayS: null }));
  const wSum = new Array<number>(days).fill(0);
  const wN = new Array<number>(days).fill(0);
  const sSum = new Array<number>(days).fill(0);
  for (const v of visits) {
    const d = Math.floor(v.start / DAY_S);
    if (d >= days) continue;
    // 구분이 애매한 방문은 확률만큼 나눠 센다(소프트 할당)
    const p = v.probs[cat];
    if (p <= 0) continue;
    const row = rows[d];
    row.visits += p;
    if (v.elim === 'urine') {
      row.urinations += p;
      row.urineG += p * v.deltaG;
    } else if (v.elim === 'feces') row.defecations += p;
    if (v.catId === cat) {
      wSum[d] += v.catWeightG;
      wN[d] += 1;
      sSum[d] += v.stayS;
    }
  }
  rows.forEach((r, d) => {
    if (wN[d] > 0) {
      r.weight = wSum[d] / wN[d] / 1000;
      r.stayS = sSum[d] / wN[d];
    }
  });
  return rows;
}

export function makeBaseline(rows: DailyRow[], days: number): Baseline | null {
  if (rows.length < days) return null;
  const head = rows.slice(0, days);
  const m = {} as Record<MetricId, number>;
  const s = {} as Record<MetricId, number>;
  for (const met of METRICS) {
    const xs = head.map((r) => metricValue(r, met.id)).filter((x): x is number => x !== null);
    const mu = mean(xs);
    m[met.id] = mu;
    // 기준선이 너무 좁으면 작은 흔들림에도 울리므로 바닥을 둔다
    // 하루 소변 양은 횟수 흔들림을 따라 평균의 30%쯤 흔들리는 게 자연스럽다
    const floor = met.id === 'urinations' ? 0.6 : met.id === 'urineG' ? 0.3 * mu : met.id === 'weight' ? 0.006 * mu : 0.5;
    s[met.id] = Math.max(sd(xs), floor);
  }
  return { days, mean: m, sd: s };
}

export interface CusumTrace {
  /** 날마다 누적합(기준선 기간은 0) */
  s: number[];
  /** 최근 7일 평균(7일이 안 되면 null) */
  mean7: (number | null)[];
}

function mean7At(rows: DailyRow[], id: MetricId, d: number): number | null {
  if (d < 6) return null;
  const xs = rows.slice(d - 6, d + 1).map((r) => metricValue(r, id)).filter((x): x is number => x !== null);
  return xs.length >= 4 ? mean(xs) : null;
}

const fmt = (x: number, digits: number): string => x.toFixed(digits);

function slowAlertText(cat: CatConfig, id: MetricId, now: number, base: number, change: number, onset: number, digits: number): { title: string; detail: string } {
  const pct = `${Math.abs(Math.round(change * 100))}%`;
  const unit = METRICS.find((m) => m.id === id)?.unit ?? '';
  const titles: Record<MetricId, string> = {
    urinations: `${cat.name}의 소변 횟수가 늘었습니다`,
    urineG: `${cat.name}의 소변 양이 늘었습니다`,
    weight: `${cat.name}의 체중이 줄고 있습니다`,
    defecations: `${cat.name}의 대변 횟수가 줄었습니다`,
  };
  return {
    title: titles[id],
    detail: `최근 7일 평균 ${fmt(now, digits)}${unit} — 평소 ${fmt(base, digits)}${unit}보다 ${pct} ${change > 0 ? '많습니다' : '적습니다'}. ${onset + 1}일째쯤부터 달라진 것으로 보입니다. 검진을 받아 볼 때입니다.`,
  };
}

/** 소변 횟수와 양은 같이 움직여서 한 묶음으로 알린다(같은 말을 두 번 하지 않게) */
const GROUP: Record<MetricId, string> = { urinations: 'urine', urineG: 'urine', weight: 'weight', defecations: 'feces' };

export function slowAlerts(cat: CatConfig, rows: DailyRow[], base: Baseline): { alerts: Alert[]; traces: Record<MetricId, CusumTrace> } {
  const alerts: Alert[] = [];
  const traces = {} as Record<MetricId, CusumTrace>;
  const acc = {} as Record<MetricId, number>;
  const lastZero = {} as Record<MetricId, number>;
  const quietUntil: Record<string, number> = {};
  const lastAlertDay: Record<string, number> = {};
  for (const met of METRICS) {
    traces[met.id] = { s: new Array<number>(rows.length).fill(0), mean7: rows.map((_, d) => mean7At(rows, met.id, d)) };
    acc[met.id] = 0;
    lastZero[met.id] = base.days - 1;
  }
  const changeAt = (id: MetricId, d: number): number | null => {
    const now = traces[id].mean7[d];
    return now === null ? null : (now - base.mean[id]) / base.mean[id];
  };

  for (let d = base.days; d < rows.length; d++) {
    for (const met of METRICS) {
      const x = metricValue(rows[d], met.id);
      if (x !== null) {
        const z = (met.dir * (x - base.mean[met.id])) / base.sd[met.id];
        acc[met.id] = Math.max(0, acc[met.id] + z - CUSUM_K);
        if (acc[met.id] === 0) lastZero[met.id] = d;
      }
      traces[met.id].s[d] = acc[met.id];
    }
    for (const met of METRICS) {
      const group = GROUP[met.id];
      const change = changeAt(met.id, d);
      const now = traces[met.id].mean7[d];
      if (acc[met.id] < CUSUM_H || change === null || now === null || d <= (quietUntil[group] ?? -1) || d - 6 < base.days) continue;
      if (met.dir * change < met.minEffect) continue;
      const onset = lastZero[met.id] + 1;
      const text = slowAlertText(cat, met.id, now, base.mean[met.id], change, onset, met.digits);
      // 다시 울리는 알림: 누적합을 비운 뒤라 "언제부터"를 다시 추정하지 않고, 아직 돌아오지 않았다고만 적는다
      const prev = lastAlertDay[group];
      if (prev !== undefined) text.detail = text.detail.replace(/ \d+일째쯤부터 달라진 것으로 보입니다\./, ` 지난 알림(${prev + 1}일째) 뒤에도 평소로 돌아오지 않았습니다.`);
      // 같은 묶음의 다른 지표도 벗어났으면 한 알림에 같이 적는다
      const sib = METRICS.find((m) => m.id !== met.id && GROUP[m.id] === group);
      const sibChange = sib ? changeAt(sib.id, d) : null;
      if (sib && sibChange !== null && sib.dir * sibChange >= sib.minEffect) {
        text.title = `${cat.name}의 소변 횟수와 양이 늘었습니다`;
        text.detail = text.detail.replace(' 검진을 받아 볼 때입니다.', ` ${sib.label}도 평소보다 ${Math.round(Math.abs(sibChange) * 100)}% ${sibChange > 0 ? '많습니다' : '적습니다'}. 검진을 받아 볼 때입니다.`);
      }
      alerts.push({ id: `${cat.id}-${met.id}-${d}`, kind: 'slow', catId: cat.id, t: (d + 1) * DAY_S - 1, metric: met.id, onsetDay: onset, change, ...text });
      quietUntil[group] = d + COOLDOWN_DAYS;
      lastAlertDay[group] = d;
      for (const m of METRICS) {
        if (GROUP[m.id] !== group) continue;
        acc[m.id] = 0;
        lastZero[m.id] = d;
      }
    }
  }
  return { alerts, traces };
}

const hhmm = (t: number): string => {
  const s = ((t % DAY_S) + DAY_S) % DAY_S;
  return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}`;
};
export const when = (t: number): string => `${Math.floor(t / DAY_S) + 1}일째 ${hhmm(t)}`;

export function urgentAlerts(visits: Identified[], cats: CatConfig[], baselines: Partial<Record<CatId, Baseline | null>>, endT: number): Alert[] {
  const alerts: Alert[] = [];
  const name = (id: CatId | null): string => cats.find((c) => c.id === id)?.name ?? '어느 고양이인지 구분 어려움';

  // 1) 배설 없는 방문이 6시간 안에 4번 이상 — 가장 가능성 높은 고양이별로 센다
  const lastBurst: Partial<Record<CatId | 'none', number>> = {};
  for (let i = 0; i < visits.length; i++) {
    const v = visits[i];
    if (v.elim !== 'none' || v.unknown) continue;
    const who = v.bestId;
    const key = who ?? 'none';
    const group = visits.filter((x) => x.elim === 'none' && !x.unknown && x.bestId === who && x.start <= v.start && x.start > v.start - BURST_WINDOW_S);
    if (group.length < BURST_N) continue;
    if ((lastBurst[key] ?? -Infinity) > v.start - 12 * 3600) continue;
    lastBurst[key] = v.start;
    const avgStay = Math.round(mean(group.map((x) => x.stayS)));
    const avgDelta = mean(group.map((x) => x.deltaG));
    const male = cats.find((c) => c.id === who)?.male;
    const conf = who ? ` (구분 확신 ${Math.round(Math.min(...group.map((x) => x.probs[who])) * 100)}% 이상)` : '';
    alerts.push({
      id: `${key}-burst-${v.start}`,
      kind: 'urgent',
      catId: who,
      t: v.end,
      title: `급한 확인: ${name(who)}가 화장실을 자주 가는데 소변이 거의 없습니다`,
      detail: `${group.length}번 들어가 평균 ${avgStay}초 머물렀지만 모래 무게가 거의 늘지 않았습니다(평균 ${avgDelta >= 0 ? '+' : ''}${avgDelta.toFixed(1)}g)${conf}. 소변이 안 나오는 상태일 수 있으니 지금 동물병원에 연락해 보세요.${male ? ' 수컷은 특히 서둘러야 합니다.' : ''}`,
    });
  }

  // 2) 평소 하루 1.5번 넘게 보던 고양이가 36시간 동안 소변 기록이 없음
  for (const cat of cats) {
    const base = baselines[cat.id];
    if (!base || base.mean.urinations < 1.5) continue;
    const startT = base.days * DAY_S;
    const urineTimes = visits.filter((v) => v.elim === 'urine' && v.bestId === cat.id && v.probs[cat.id] >= 0.5).map((v) => v.end);
    let last = startT;
    let fired = false;
    const check = (until: number): void => {
      if (!fired && until - last >= NO_URINE_S) {
        const t = last + NO_URINE_S;
        alerts.push({
          id: `${cat.id}-nourine-${t}`,
          kind: 'urgent',
          catId: cat.id,
          t,
          title: `급한 확인: ${cat.name}의 소변 기록이 36시간 동안 없습니다`,
          detail: `마지막 소변 기록은 ${when(last)}입니다. 다른 곳에 봤을 수도 있지만, 소변이 안 나오는 상태일 수 있으니 지금 확인하고 동물병원에 연락해 보세요.${cat.male ? ' 수컷은 특히 서둘러야 합니다.' : ''}`,
        });
        fired = true;
      }
    };
    for (const t of urineTimes) {
      if (t < startT) continue;
      check(t);
      last = t;
      fired = false;
    }
    check(endT);
  }
  return alerts.sort((a, b) => a.t - b.t);
}

// ---------- 시뮬레이터 정답과 비교(연구 질문 1·2) ----------

export interface Evaluation {
  trueVisits: number;
  detected: number;
  matched: number;
  elimCorrect: number;
  assigned: number;
  idCorrect: number;
  weightMaeG: number;
  massMaeG: number;
  /** 시나리오의 변화를 처음 알린 시점까지 걸린 시간(초). 변화가 없거나 아직 못 잡았으면 null */
  delayS: number | null;
  /** 변화와 상관없는 알림 수 */
  falseAlerts: number;
  onsetT: number | null;
}

export function evaluate(days: SimDay[], visits: Identified[], alerts: Alert[], config: SimConfig): Evaluation {
  const truth = days.flatMap((d) => d.truth);
  let matched = 0;
  let elimCorrect = 0;
  let assigned = 0;
  let idCorrect = 0;
  const wErr: number[] = [];
  const mErr: number[] = [];
  let j = 0;
  for (const tv of truth) {
    while (j < visits.length && visits[j].start < tv.start - 15) j++;
    const v = visits[j];
    if (!v || Math.abs(v.start - tv.start) > 15) continue;
    matched += 1;
    if (v.elim === tv.elim) elimCorrect += 1;
    if (v.catId) {
      assigned += 1;
      if (v.catId === tv.catId) idCorrect += 1;
    }
    wErr.push(Math.abs(v.catWeightG - tv.catWeightG));
    if (tv.elim !== 'none') mErr.push(Math.abs(v.deltaG - tv.massG));
  }

  const sc = scenarioById(config.scenario);
  const target = targetCat(config);
  let onsetT: number | null = null;
  if (sc.onsetDay !== null) onsetT = sc.id === 'noUrine' ? ONSET_URGENT * DAY_S + 7 * 3600 : sc.onsetDay * DAY_S;
  const expected = (a: Alert): boolean => {
    if (onsetT === null || a.t < onsetT || a.catId !== target) return false;
    if (sc.id === 'noUrine') return a.kind === 'urgent';
    if (sc.id === 'weightLoss') return a.metric === 'weight';
    return a.metric === 'urinations' || a.metric === 'urineG';
  };
  const hit = alerts.filter(expected).sort((x, y) => x.t - y.t)[0];
  return {
    trueVisits: truth.length,
    detected: visits.length,
    matched,
    elimCorrect,
    assigned,
    idCorrect,
    weightMaeG: mean(wErr),
    massMaeG: mean(mErr),
    delayS: hit && onsetT !== null ? hit.t - onsetT : null,
    falseAlerts: alerts.filter((a) => !expected(a)).length,
    onsetT,
  };
}

// ---------- 한 번에 ----------

export interface AnalyzeOptions {
  baselineDays: number;
  useStay: boolean;
}

export interface Analysis {
  days: number;
  visits: Identified[];
  shifts: LevelShift[];
  rows: Partial<Record<CatId, DailyRow[]>>;
  baselines: Partial<Record<CatId, Baseline | null>>;
  traces: Partial<Record<CatId, Record<MetricId, CusumTrace>>>;
  alerts: Alert[];
  evaluation: Evaluation;
  ambiguous: number;
}

export function analyze(days: SimDay[], config: SimConfig, opts: AnalyzeOptions): Analysis {
  const samples = days.flatMap((d) => d.samples);
  const { visits: raw, shifts } = detectVisits(samples);
  const visits = identify(raw, config.cats, { useStay: opts.useStay, noiseG: config.noiseG });
  const rows: Analysis['rows'] = {};
  const baselines: Analysis['baselines'] = {};
  const traces: Analysis['traces'] = {};
  const slow: Alert[] = [];
  for (const cat of config.cats) {
    const r = dailyRows(visits, cat.id, days.length);
    rows[cat.id] = r;
    const b = makeBaseline(r, opts.baselineDays);
    baselines[cat.id] = b;
    if (b) {
      const res = slowAlerts(cat, r, b);
      slow.push(...res.alerts);
      traces[cat.id] = res.traces;
    }
  }
  const endT = days.length * DAY_S;
  const alerts = [...slow, ...urgentAlerts(visits, config.cats, baselines, endT)].sort((a, b) => b.t - a.t);
  return {
    days: days.length,
    visits,
    shifts,
    rows,
    baselines,
    traces,
    alerts,
    evaluation: evaluate(days, visits, alerts, config),
    ambiguous: visits.filter((v) => !v.catId).length,
  };
}

