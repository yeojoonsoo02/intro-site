import { ACTIVE, BREATH_WIN, WAKE_ACTIVE, WAKE_FROM, WAKE_WIN, activeShare, dayStats, expectedBed, expectedWake } from './detect';
import { mix, mulberry32 } from './simulate';
import {
  DAY_MIN,
  type Baseline,
  type Incident,
  type Ladder,
  type Notice,
  type RadarMinute,
  type RuleId,
  type Stage,
  type State,
  type Thresholds,
  type TruthState,
} from './types';

// 이탈 규칙과 단계 알림.
// 규칙 네 개(급한 쪽) — 하나라도 맞으면 본인 폰부터 묻는다.
//   fall      : 쓰러짐 표시 뒤 fallMin분 동안 움직임 없음
//   noBreath  : 정지 + 호흡 미검출이 stillMin분 이어짐
//   wakeLate  : 평소 기상 시각 + 여유 시간이 지나도 움직임 없음(집에 있을 때만)
//   longStill : 깨어 있는 동안, 평소 가장 길게 가만히 있던 시간 + 여유 시간보다 오래 가만히 있음
// 호흡이 잡히면(자거나 쉬는 중) wakeLate·longStill은 SLEEP_EXTRA분 더 기다린다 — 늦잠 헛경보를 줄이는 장치.
// 느린 변화(활동 감소)는 급한 알림이 아니라 주간 요약(notice)으로만 낸다.
// 단계: 본인 폰 "괜찮으세요?" → selfWaitMin 안에 답이 없으면 관리자 → managerWaitMin 안에 해결이 안 되면 연락처.
// 본인이 "괜찮아요"를 누르거나, 레이더가 2분 연달아 움직임을 보면 그 자리에서 멈춘다. "괜찮아요" 뒤 같은 규칙은 1시간 조용하다.

export const SLEEP_EXTRA = 120;
/** "괜찮아요"를 누르면 같은 규칙은 이만큼 조용히 있는다 */
export const SNOOZE_MIN = 60;
export const TREND_DROP = 0.25;

export const DEFAULT_THRESHOLDS: Thresholds = { graceMin: 90, stillMin: 45, fallMin: 10, useBreathing: true };
export const DEFAULT_LADDER: Ladder = { selfWaitMin: 10, managerWaitMin: 30 };

export const RULE_LABEL: Record<RuleId, string> = {
  fall: '쓰러짐 뒤 무활동',
  noBreath: '정지 + 호흡 미검출',
  wakeLate: '기상 시각 지남',
  longStill: '평소보다 오래 정지',
};

export const STAGE_LABEL: Record<Stage, string> = {
  self: '본인 폰 확인',
  manager: '관리자',
  contact: '비상 연락처',
};

export const hm = (minOfDay: number): string => {
  const m = ((Math.round(minOfDay) % DAY_MIN) + DAY_MIN) % DAY_MIN;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

/** "3일째 07:40" */
export const when = (t: number): string => `${Math.floor(t / DAY_MIN) + 1}일째 ${hm(t % DAY_MIN)}`;

/** 알림을 받은 본인이 몇 분 뒤 "괜찮아요"를 누르는지. 누르지 못하면 null. */
export type Responder = (t0: number) => number | null;

/**
 * 시뮬레이션 속 본인의 응답. 시뮬레이터 정답(지금 실제 상태)에 따라 다르다.
 * 쓰러진 사람은 폰을 못 누른다. 자는 사람은 절반쯤 깨서 누르고, 깨어 있으면 대개 몇 분 안에 누른다.
 */
export function makeResponder(truth: TruthState[], seed: number): Responder {
  return (t0) => {
    const u = mulberry32(mix(seed ^ 0x51ed, t0));
    const s = truth[t0];
    const p = u();
    const d = u();
    switch (s) {
      case 'fallen':
        return null;
      case 'sleep':
        return p < 0.55 ? Math.round(2 + d * 20) : null;
      case 'rest':
        return p < 0.9 ? Math.round(1 + d * 7) : null;
      case 'active':
      case 'away':
        return p < 0.95 ? Math.round(1 + d * 4) : null;
    }
  };
}

export interface LadderState {
  /** 지금까지 간 단계 */
  stages: Stage[];
  /** 지금 기다리는 단계 */
  current: Stage;
  cancelled: boolean;
  /** 연락처까지 갔다 */
  done: boolean;
  /** 다음 단계까지 남은 분(멈췄거나 끝났으면 null) */
  nextInMin: number | null;
}

/** 알림 뒤 elapsedMin분이 지났을 때 사다리의 모습. okAt은 "괜찮아요"를 누른 경과 분. */
export function ladderAt(elapsedMin: number, ladder: Ladder, okAt: number | null): LadderState {
  const toManager = ladder.selfWaitMin;
  const toContact = ladder.selfWaitMin + ladder.managerWaitMin;
  const stopAt = okAt !== null && okAt <= elapsedMin ? okAt : Infinity;
  const stages: Stage[] = ['self'];
  // 같은 분에 누르면 넘어가기 전에 멈춘 것으로 본다
  if (elapsedMin >= toManager && stopAt > toManager) stages.push('manager');
  if (elapsedMin >= toContact && stopAt > toContact) stages.push('contact');
  const current = stages[stages.length - 1];
  const cancelled = stopAt !== Infinity;
  const done = current === 'contact';
  const nextInMin = cancelled || done ? null : (current === 'self' ? toManager : toContact) - elapsedMin;
  return { stages, current, cancelled, done, nextInMin };
}

interface Fired {
  rule: RuleId;
  title: string;
  detail: string;
}

export interface AlertResult {
  incidents: Incident[];
  notices: Notice[];
}

/**
 * 분마다 규칙을 돌려 사건(알림)과 주간 요약을 만든다.
 * startT 전(기준선 기간)에는 알리지 않는다. 레이더 값·상태·기준선만 보고, 시뮬레이터 정답은 responder로만 들어온다.
 */
export function runAlerts(
  minutes: RadarMinute[],
  states: State[],
  baseline: Baseline,
  th: Thresholds,
  ladder: Ladder,
  responder: Responder,
  startT: number,
): AlertResult {
  const incidents: Incident[] = [];
  const notices: Notice[] = [];
  const n = minutes.length;
  const total = ladder.selfWaitMin + ladder.managerWaitMin;
  let busyUntil = startT;
  // 연락처까지 갔으면 사람이 가 본다. 레이더가 다시 움직임을 볼 때까지 새 알림을 내지 않는다.
  let waitActive = false;
  let fallRun = 0;
  let noBreathRun = 0;
  let stillRun = 0;
  let lastBreath = -Infinity;
  let awakeToday = false;
  let winCount = 0;
  let wakeDoneDay = -1;
  let lastNoticeDay = -Infinity;
  const shares: (number | null)[] = [];
  const snooze: Record<RuleId, number> = { fall: -1, noBreath: -1, wakeLate: -1, longStill: -1 };

  for (let i = 0; i < n; i++) {
    const s = states[i];
    const m = minutes[i];
    const day = Math.floor(i / DAY_MIN);
    const tod = i - day * DAY_MIN;
    if (m.breath !== null) lastBreath = i;
    const breathRecent = i - lastBreath <= BREATH_WIN;

    // 쓰러짐 표시가 한두 분 빠져도(키트가 놓침) 세던 것을 지우지 않는다. 움직이거나 나가야 0으로.
    if (s === 'fallen') fallRun = m.motion < ACTIVE ? fallRun + 1 : 0;
    else if (s === 'active' || s === 'away') fallRun = 0;
    noBreathRun = s === 'stillNoBreath' ? noBreathRun + 1 : 0;
    stillRun = s !== 'active' && s !== 'away' ? stillRun + 1 : 0;

    // 오늘 일어났나(04시 뒤 30분 안에 8분 넘게 움직임) — 밤중 화장실은 걸러진다. 나갔으면 일어난 것.
    if (tod === WAKE_FROM) {
      awakeToday = false;
      winCount = 0;
    }
    if (tod >= WAKE_FROM) {
      if (s === 'active') winCount++;
      if (tod - WAKE_WIN >= WAKE_FROM && states[i - WAKE_WIN] === 'active') winCount--;
      if (winCount >= WAKE_ACTIVE || s === 'away') awakeToday = true;
    }

    // 하루가 끝나면 활동 추세(느린 변화)
    if (tod === DAY_MIN - 1) {
      shares[day] = activeShare(dayStats(states, day));
      const startDay = Math.ceil(startT / DAY_MIN);
      // 연락처까지 간 사건이 아직 정리되지 않았으면(waitActive) 요약을 보태지 않는다
      if (!waitActive && day >= startDay + 6 && day - lastNoticeDay >= 7) {
        const last = shares.slice(day - 6, day + 1).filter((v): v is number => v !== null && v !== undefined);
        if (last.length >= 4) {
          const mean7 = last.reduce((a, b) => a + b, 0) / last.length;
          const base = baseline.activeShare;
          if (mean7 < base.mean * (1 - TREND_DROP) && mean7 < base.mean - 2 * base.sd) {
            lastNoticeDay = day;
            notices.push({
              day,
              title: '생활 리듬 변화: 집에서 움직이는 시간이 줄었어요',
              detail: `최근 7일 집에 있는 동안 움직인 비율 ${Math.round(mean7 * 100)}% — 평소 ${Math.round(base.mean * 100)}%보다 ${Math.round((1 - mean7 / base.mean) * 100)}% 적습니다. 급한 알림이 아니라 본인과 관리자에게 가는 주간 요약입니다.`,
            });
          }
        }
      }
    }

    if (waitActive && s === 'active' && states[i - 1] === 'active') waitActive = false;
    if (i < startT || i < busyUntil || waitActive) continue;

    let fired: Fired | null = null;
    const exp = expectedWake(baseline, day);
    if (fallRun >= th.fallMin && i >= snooze.fall) {
      fired = { rule: 'fall', title: '쓰러짐 표시 뒤 움직임이 없어요', detail: `천장 센서가 바닥에 누운 사람을 본 뒤 ${th.fallMin}분 넘게 움직임이 없습니다.` };
    } else if (noBreathRun >= th.stillMin && i >= snooze.noBreath) {
      fired = { rule: 'noBreath', title: '가만히 있는데 호흡이 안 잡혀요', detail: `${th.stillMin}분 넘게 움직임이 없고 호흡도 잡히지 않습니다.` };
    } else if (awakeToday && tod < expectedBed(baseline, day) - 30 && i >= snooze.longStill) {
      const limit = baseline.maxStill + th.graceMin + (th.useBreathing && breathRecent ? SLEEP_EXTRA : 0);
      if (stillRun >= limit)
        fired = {
          rule: 'longStill',
          title: '평소보다 훨씬 오래 가만히 있어요',
          detail: `깨어 있는 동안 평소 가장 길게 가만히 있던 시간(${baseline.maxStill}분)보다 ${th.graceMin}분 넘게 더 움직임이 없습니다.`,
        };
    }
    if (!fired && exp !== null && day !== wakeDoneDay && !awakeToday && tod >= exp + th.graceMin) {
      if (s === 'away') wakeDoneDay = day;
      else if (!(th.useBreathing && breathRecent && tod < exp + th.graceMin + SLEEP_EXTRA)) {
        wakeDoneDay = day;
        fired = {
          rule: 'wakeLate',
          title: '평소 일어날 시간이 지났는데 움직임이 없어요',
          detail: `평소 ${hm(exp)}쯤 일어나는데 ${hm(tod)}까지 움직임이 없습니다${th.useBreathing && breathRecent ? '(호흡은 잡히지만 2시간을 더 기다렸습니다)' : ''}.`,
        };
      }
    }
    if (!fired) continue;

    // 사다리를 돌린다
    const r = responder(i);
    const okT = r === null ? Infinity : i + Math.max(1, r);
    let motionT = Infinity;
    for (let j = i + 2; j <= Math.min(n - 1, i + total); j++) {
      if (states[j] === 'active' && states[j - 1] === 'active') {
        motionT = j;
        break;
      }
    }
    const stopT = Math.min(okT, motionT);
    const stages: { stage: Stage; t: number }[] = [{ stage: 'self', t: i }];
    if (stopT > i + ladder.selfWaitMin) stages.push({ stage: 'manager', t: i + ladder.selfWaitMin });
    if (stopT > i + total) stages.push({ stage: 'contact', t: i + total });
    const outcome: Incident['outcome'] = stopT <= i + total ? (okT <= motionT ? 'ok' : 'motion') : 'contact';
    const endT = Math.min(stopT, i + total);
    incidents.push({ id: incidents.length + 1, rule: fired.rule, t: i, stages, outcome, endT, title: fired.title, detail: fired.detail });
    if (outcome === 'contact') {
      busyUntil = endT;
      waitActive = true;
      fallRun = 0;
      noBreathRun = 0;
      stillRun = 0;
    } else {
      busyUntil = endT;
      if (outcome === 'ok') snooze[fired.rule] = endT + SNOOZE_MIN;
      if (fired.rule === 'fall') fallRun = 0;
      if (fired.rule === 'noBreath') noBreathRun = 0;
      if (fired.rule === 'longStill') stillRun = 0;
    }
  }
  return { incidents, notices };
}
