// 1인가구 생활 리듬 레이더 데모의 공용 타입. 시간 단위는 전부 분이다.
// t는 시뮬레이션 0일째(월요일) 0시부터 센 분, day = Math.floor(t / DAY_MIN).

export const DAY_MIN = 1440;

/** 레이더 키트가 1분마다 내보낸다고 가정하는 결과값(원신호 I/Q가 아니라 키트가 계산한 값) */
export interface RadarMinute {
  t: number;
  /** 사람이 있음(움직임 + 정지 재실) */
  presence: boolean;
  /** 움직임 세기 0~100 */
  motion: number;
  /** 호흡수(회/분). 가만히 있고 침대 센서 범위 안일 때만 잡히고, 못 잡으면 null */
  breath: number | null;
  /** 천장 센서의 쓰러짐·바닥 점유 표시 */
  fall: boolean;
}

/** 시뮬레이터가 아는 실제 상태(알고리즘은 보지 않는다 — 정답 비교에만 쓴다) */
export type TruthState = 'away' | 'active' | 'rest' | 'sleep' | 'fallen';

/** 알고리즘이 레이더 값만 보고 정한 상태 */
export type State = 'away' | 'active' | 'resting' | 'stillNoBreath' | 'fallen';

export type ScenarioId = 'normal' | 'oversleep' | 'longAway' | 'fall' | 'decline';

export type Noise = 'low' | 'normal' | 'high';

export interface SimConfig {
  scenario: ScenarioId;
  days: number;
  seed: number;
  /** 천장 낙상 센서를 달았는지(없으면 쓰러짐 표시가 나오지 않는다) */
  fallSensor: boolean;
  noise: Noise;
}

/** 하루 일과(시뮬레이터 내부 계획, 정답 비교용으로 밖에 보인다) */
export interface DayPlan {
  day: number;
  weekend: boolean;
  /** 일어난 시각(그날 0시부터 분) */
  wake: number;
  /** 잠든 시각(그날 0시부터 분, 자정 넘으면 1440 이상) */
  bed: number;
  /** 외출 구간들(그날 0시부터 분) */
  outings: { from: number; to: number }[];
}

export interface SimResult {
  config: SimConfig;
  minutes: RadarMinute[];
  truth: TruthState[];
  plans: DayPlan[];
  /** 응급 상황(쓰러짐)이 시작된 분. 없으면 null */
  emergencyT: number | null;
  /** 느린 변화(활동 감소)가 시작된 날. 없으면 null */
  slowOnsetDay: number | null;
  /** 늦잠·장기 외출처럼 "헛경보를 부르는" 날들(설명용) */
  trickyDays: number[];
}

export interface Thresholds {
  /** 여유 시간(분): 평소 기상 시각·평소 가장 긴 정지 시간보다 이만큼 더 지나야 알린다 */
  graceMin: number;
  /** 무활동 분: 정지 + 호흡 미검출이 이만큼 이어지면 알린다 */
  stillMin: number;
  /** 쓰러짐 표시 뒤 움직임 없이 이만큼 지나면 알린다 */
  fallMin: number;
  /** 호흡이 보이면(자는 중·쉬는 중) 한 번 더 기다린다 */
  useBreathing: boolean;
}

export interface Ladder {
  /** 본인 폰 확인 뒤 관리자로 넘어가기까지(분) */
  selfWaitMin: number;
  /** 관리자 확인 뒤 연락처로 넘어가기까지(분) */
  managerWaitMin: number;
}

export type RuleId = 'fall' | 'noBreath' | 'wakeLate' | 'longStill';

export type Stage = 'self' | 'manager' | 'contact';

export interface Baseline {
  days: number;
  /** 평소 기상 시각(분, 중앙값) */
  wake: { weekday: number | null; weekend: number | null };
  /** 평소 잠드는 시각(분, 중앙값, 자정 넘으면 1440 이상) */
  bed: { weekday: number | null; weekend: number | null };
  /** 하루 활동 비율(집에 있던 시간 중 움직인 비율) */
  activeShare: { mean: number; sd: number };
  /** 깨어 있는 동안 가장 길게 가만히 있던 시간(분, 기준선 기간 최댓값) */
  maxStill: number;
  /** 시간대(0~23시)별 집에 없던 비율 */
  awayShare: number[];
}

export interface Incident {
  id: number;
  rule: RuleId;
  t: number;
  /** 도달한 단계들과 그 시각 */
  stages: { stage: Stage; t: number }[];
  /** 어떻게 끝났나 */
  outcome: 'ok' | 'motion' | 'contact';
  /** 끝난 시각 */
  endT: number;
  title: string;
  detail: string;
}

export interface Notice {
  day: number;
  title: string;
  detail: string;
}
