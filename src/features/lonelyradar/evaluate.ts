import { buildBaseline, classify } from './detect';
import { makeResponder, runAlerts, type AlertResult } from './alerts';
import { simulate } from './simulate';
import { DAY_MIN, type Baseline, type Incident, type Ladder, type Noise, type ScenarioId, type SimConfig, type SimResult, type State, type Thresholds } from './types';

// 시뮬레이터 정답과 비교해 헛경보·검출 지연을 잰다. 화면의 "헛경보 미터"는 전부 여기서 계산한다(미리 적어 둔 값 없음).
// 레이더 값 → 상태 → 기준선은 문턱값과 상관없어 한 번만 만들고, 문턱값을 바꿀 때는 규칙만 다시 돌린다.

export interface Prepared {
  sim: SimResult;
  states: State[];
  baseline: Baseline;
  baselineDays: number;
}

export function prepare(cfg: SimConfig, baselineDays: number): Prepared {
  const sim = simulate(cfg);
  const states = classify(sim.minutes);
  return { sim, states, baseline: buildBaseline(states, baselineDays), baselineDays };
}

export function alertsFor(p: Prepared, th: Thresholds, ladder: Ladder): AlertResult {
  return runAlerts(p.sim.minutes, p.states, p.baseline, th, ladder, makeResponder(p.sim.truth, p.sim.config.seed), p.baselineDays * DAY_MIN);
}

export interface RunEval {
  /** 알림을 낼 수 있던 기간(주) — 기준선 뒤부터 응급 상황 전까지 */
  monitoredWeeks: number;
  /** 응급이 아닌데 울린 알림(본인 확인 단계) */
  falseAlerts: number;
  /** 그중 관리자까지 간 것 */
  falseManager: number;
  /** 그중 연락처까지 간 것 */
  falseContact: number;
  /** 응급 상황부터 첫 알림까지(분). 응급이 없거나 놓쳤으면 null */
  delayMin: number | null;
  /** 응급 상황에서 관리자에게 닿기까지(분) */
  managerDelayMin: number | null;
  /** 응급이 있었는데 시뮬레이션 끝까지 알림이 없음 */
  missed: boolean;
  /** 활동 감소가 시작된 날부터 주간 요약까지(일) */
  noticeDelayDays: number | null;
  /** 활동 감소가 없는데 나간 주간 요약 */
  falseNotices: number;
}

export function evaluateRun(p: Prepared, r: AlertResult): RunEval {
  const { sim } = p;
  const start = p.baselineDays * DAY_MIN;
  const end = sim.emergencyT ?? sim.minutes.length;
  const isFalse = (x: Incident): boolean => sim.emergencyT === null || x.t < sim.emergencyT;
  const falses = r.incidents.filter(isFalse);
  const first = sim.emergencyT === null ? undefined : r.incidents.find((x) => x.t >= (sim.emergencyT as number));
  const mgr = first?.stages.find((s) => s.stage === 'manager');
  const onset = sim.slowOnsetDay;
  const notice = onset === null ? undefined : r.notices.find((x) => x.day >= onset);
  return {
    monitoredWeeks: Math.max(0, end - start) / (7 * DAY_MIN),
    falseAlerts: falses.length,
    falseManager: falses.filter((x) => x.stages.some((s) => s.stage === 'manager')).length,
    falseContact: falses.filter((x) => x.outcome === 'contact').length,
    delayMin: first && sim.emergencyT !== null ? first.t - sim.emergencyT : null,
    managerDelayMin: mgr && sim.emergencyT !== null ? mgr.t - sim.emergencyT : null,
    missed: sim.emergencyT !== null && !first,
    noticeDelayDays: notice && onset !== null ? notice.day - onset : null,
    falseNotices: r.notices.filter((x) => (onset === null || x.day < onset) && (x.day + 1) * DAY_MIN <= end).length,
  };
}

// ---------- 헛경보 미터 ----------

export interface MeterInputs {
  baselineDays: number;
  normal: Prepared[];
  oversleep: Prepared[];
  longAway: Prepared[];
  fall: Prepared[];
  fallNoSensor: Prepared[];
  decline: Prepared[];
}

export const METER_DAYS = 42;
export const METER_SEEDS = [11, 23, 37, 41, 53, 67];

/** 미터에 쓸 시뮬레이션을 만든다(시나리오 5개 × 시드 6개 × 42일, 낙상 센서 있음·없음). */
export function prepareMeter(baselineDays: number, noise: Noise, seeds: number[] = METER_SEEDS, days = METER_DAYS): MeterInputs {
  const make = (scenario: ScenarioId, fallSensor = true): Prepared[] => seeds.map((seed) => prepare({ scenario, days, seed, fallSensor, noise }, baselineDays));
  return {
    baselineDays,
    normal: make('normal'),
    oversleep: make('oversleep'),
    longAway: make('longAway'),
    fall: make('fall'),
    fallNoSensor: make('fall', false),
    decline: make('decline'),
  };
}

export interface MeterCell {
  /** 시나리오별 주당 헛경보(본인 확인) */
  falsePerWeek: { normal: number; oversleep: number; longAway: number };
  /** 세 시나리오를 합친 주당 관리자까지 간 헛경보 */
  managerPerWeek: number;
  /** 쓰러짐부터 첫 알림까지 중앙값(분) */
  fallDelay: { sensor: number | null; noSensor: number | null };
  /** 쓰러짐부터 관리자에게 닿기까지 중앙값(분, 센서 있음) */
  fallManagerDelay: number | null;
  /** 쓰러짐을 놓친 비율 */
  fallMissed: { sensor: number; noSensor: number };
  /** 활동 감소 → 주간 요약까지 중앙값(일) */
  declineDays: number | null;
  runs: number;
}

function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function perWeek(evals: RunEval[], key: 'falseAlerts' | 'falseManager'): number {
  const weeks = evals.reduce((a, e) => a + e.monitoredWeeks, 0);
  return weeks ? evals.reduce((a, e) => a + e[key], 0) / weeks : 0;
}

export function meterCell(inp: MeterInputs, th: Thresholds, ladder: Ladder): MeterCell {
  const ev = (ps: Prepared[]): RunEval[] => ps.map((p) => evaluateRun(p, alertsFor(p, th, ladder)));
  const normal = ev(inp.normal);
  const oversleep = ev(inp.oversleep);
  const longAway = ev(inp.longAway);
  const fall = ev(inp.fall);
  const fallNo = ev(inp.fallNoSensor);
  const decline = ev(inp.decline);
  const delays = (es: RunEval[]): number[] => es.map((e) => e.delayMin).filter((v): v is number => v !== null);
  return {
    falsePerWeek: { normal: perWeek(normal, 'falseAlerts'), oversleep: perWeek(oversleep, 'falseAlerts'), longAway: perWeek(longAway, 'falseAlerts') },
    managerPerWeek: perWeek([...normal, ...oversleep, ...longAway], 'falseManager'),
    fallDelay: { sensor: median(delays(fall)), noSensor: median(delays(fallNo)) },
    fallManagerDelay: median(fall.map((e) => e.managerDelayMin).filter((v): v is number => v !== null)),
    fallMissed: { sensor: fall.filter((e) => e.missed).length / fall.length, noSensor: fallNo.filter((e) => e.missed).length / fallNo.length },
    declineDays: median(decline.map((e) => e.noticeDelayDays).filter((v): v is number => v !== null)),
    runs: inp.normal.length,
  };
}

export type SweepParam = 'graceMin' | 'stillMin' | 'fallMin';

export const SWEEP_VALUES: Record<SweepParam, number[]> = {
  graceMin: [30, 60, 90, 120, 180],
  stillMin: [15, 30, 45, 60, 90],
  fallMin: [3, 5, 10, 20, 30],
};

/** 문턱값 하나만 바꿔 가며 미터를 다시 잰다 */
export function sweep(inp: MeterInputs, th: Thresholds, ladder: Ladder, param: SweepParam): { value: number; cell: MeterCell }[] {
  return SWEEP_VALUES[param].map((value) => ({ value, cell: meterCell(inp, { ...th, [param]: value }, ladder) }));
}
