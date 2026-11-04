// 노령묘 화장실 무게 센서 데모의 공용 타입. 단위는 전부 그램(g)·초(s)다.
// 시간 t는 시뮬레이션 0일째 0시부터 센 초, day = Math.floor(t / 86400).

export const DAY_S = 86_400;

export type CatId = 'A' | 'B' | 'C';
export const CAT_IDS: readonly CatId[] = ['A', 'B', 'C'];

export interface CatConfig {
  id: CatId;
  name: string;
  /** 등록할 때 보호자가 적는 대략의 체중(g) — 시뮬레이터의 실제 체중이기도 하다 */
  weightG: number;
  male: boolean;
}

export type ScenarioId = 'normal' | 'polyuria' | 'weightLoss' | 'noUrine' | 'similar';

export interface SimConfig {
  scenario: ScenarioId;
  cats: CatConfig[];
  /** 로드셀 잡음 표준편차(g) */
  noiseG: number;
  /** 모래 습기·소변 덩어리 증발로 무게가 천천히 변하는지 */
  drift: boolean;
  seed: number;
}

/** 저울 한 번 읽은 값. 변화가 없으면 10분에 한 번, 변화가 있으면 1초에 한 번 올라온다. */
export interface Sample {
  t: number;
  w: number;
}

export type Elim = 'urine' | 'feces' | 'none';

/** 시뮬레이터가 아는 정답(알고리즘은 보지 않는다 — 성능 비교에만 쓴다) */
export interface TrueVisit {
  catId: CatId;
  start: number;
  end: number;
  elim: Elim;
  /** 실제로 나온 양(g) */
  massG: number;
  /** 그 순간의 실제 체중(g) */
  catWeightG: number;
}

export interface Maintenance {
  t: number;
  kind: 'scoop' | 'refill';
}

export interface SimDay {
  day: number;
  samples: Sample[];
  truth: TrueVisit[];
  maintenance: Maintenance[];
}

/** 무게 신호에서 찾은 방문 하나 */
export interface DetectedVisit {
  id: number;
  start: number;
  end: number;
  stayS: number;
  /** 들어가기 전 모래 무게 */
  preG: number;
  /** 나온 뒤 모래 무게 */
  postG: number;
  /** 모래 무게 변화 = 배설량 추정(g) */
  deltaG: number;
  /** 추정 체중(g) */
  catWeightG: number;
  /** 가장 오래 가만히 있던 구간(초) — 소변 자세 */
  stillS: number;
  elim: Elim;
}

export interface LevelShift {
  t: number;
  deltaG: number;
}

export interface Identified extends DetectedVisit {
  /** 고양이별 확률(합 1). 등록되지 않은 무게면 전부 0 */
  probs: Record<CatId, number>;
  /** 확률이 기준 이상이면 그 고양이, 아니면 null(구분 어려움) */
  catId: CatId | null;
  /** 가장 가능성 높은 고양이(구분 어려움이어도 채움) */
  bestId: CatId | null;
  confidence: number;
  unknown: boolean;
}

export type MetricId = 'urinations' | 'urineG' | 'weight' | 'defecations';

export interface DailyRow {
  day: number;
  visits: number;
  urinations: number;
  urineG: number;
  defecations: number;
  /** 확실히 이 고양이로 구분된 방문의 평균 체중. 없으면 null */
  weight: number | null;
  stayS: number | null;
}

export interface Baseline {
  days: number;
  mean: Record<MetricId, number>;
  sd: Record<MetricId, number>;
}

export interface Alert {
  id: string;
  kind: 'urgent' | 'slow';
  catId: CatId | null;
  t: number;
  metric?: MetricId;
  /** 변화가 시작됐다고 추정한 날(느린 변화) */
  onsetDay?: number;
  /** 최근 7일 평균의 기준선 대비 변화율 */
  change?: number;
  title: string;
  detail: string;
}
