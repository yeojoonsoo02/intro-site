import { test, expect } from '@playwright/test';
import { ACTIVE, buildBaseline, classify, dayStats } from '@/features/lonelyradar/detect';
import { DEFAULT_LADDER, DEFAULT_THRESHOLDS, ladderAt, runAlerts, type Responder } from '@/features/lonelyradar/alerts';
import { alertsFor, evaluateRun, meterCell, prepare, prepareMeter } from '@/features/lonelyradar/evaluate';
import { simulate } from '@/features/lonelyradar/simulate';
import { DAY_MIN, type RadarMinute, type ScenarioId } from '@/features/lonelyradar/types';

// 생활 리듬 레이더 데모의 알고리즘 점검. 브라우저 없이 함수만 본다.
// 시뮬레이터는 시드가 같으면 같은 값을 만들어서, 정답과 비교한 수치가 흔들리지 않는다.

const still = (t: number, breath: number | null = null): RadarMinute => ({ t, presence: true, motion: 3, breath, fall: false });
const moving = (t: number): RadarMinute => ({ t, presence: true, motion: 50, breath: null, fall: false });
const gone = (t: number): RadarMinute => ({ t, presence: false, motion: 0, breath: null, fall: false });

function run(scenario: ScenarioId, seed: number, fallSensor = true, th = DEFAULT_THRESHOLDS) {
  const p = prepare({ scenario, days: 42, seed, fallSensor, noise: 'normal' }, 14);
  const r = alertsFor(p, th, DEFAULT_LADDER);
  return { p, r, e: evaluateRun(p, r) };
}

test.describe('상태 머신', () => {
  test('손으로 만든 값: 움직임 · 정지+호흡 · 정지+호흡 미검출 · 집에 없음 · 쓰러짐', () => {
    const m: RadarMinute[] = [];
    for (let t = 0; t < 5; t++) m.push(moving(t));
    m.push(still(5, 14)); // 호흡 잡힘
    for (let t = 6; t < 16; t++) m.push(still(t)); // 10분까지는 "최근 호흡" 안
    for (let t = 16; t < 20; t++) m.push(still(t)); // 그 뒤는 호흡 미검출
    for (let t = 20; t < 22; t++) m.push(gone(t)); // 두 분 끊김 = 정적 재실 놓침
    for (let t = 22; t < 30; t++) m.push(gone(t)); // 다섯 분 넘게 = 나감
    m.push({ t: 30, presence: true, motion: 2, breath: null, fall: true });
    const s = classify(m);
    expect(s[0]).toBe('active');
    expect(s[5]).toBe('resting');
    expect(s[15]).toBe('resting');
    expect(s[16]).toBe('stillNoBreath');
    expect(s[25]).toBe('away');
    expect(s[20]).toBe('away'); // 다섯 분째에 앞 분들도 나간 것으로 고친다
    expect(s[30]).toBe('fallen');
    expect(ACTIVE).toBe(15);
  });

  test('시뮬레이션: 알고리즘 상태가 정답과 대체로 맞는다', () => {
    const sim = simulate({ scenario: 'normal', days: 14, seed: 3, fallSensor: true, noise: 'normal' });
    const s = classify(sim.minutes);
    let away = 0;
    let awayOk = 0;
    let sleep = 0;
    let sleepOk = 0;
    for (let i = 0; i < s.length; i++) {
      if (sim.truth[i] === 'away') {
        away++;
        if (s[i] === 'away') awayOk++;
      }
      if (sim.truth[i] === 'sleep') {
        sleep++;
        if (s[i] === 'resting') sleepOk++;
      }
    }
    expect(awayOk / away).toBeGreaterThan(0.97);
    expect(sleepOk / sleep).toBeGreaterThan(0.85);
  });
});

test.describe('기준선', () => {
  test('평일·주말 기상 시각을 시뮬레이터 계획에 가깝게 잡는다', () => {
    const sim = simulate({ scenario: 'normal', days: 14, seed: 5, fallSensor: true, noise: 'normal' });
    const s = classify(sim.minutes);
    const b = buildBaseline(s, 14);
    const median = (xs: number[]): number => [...xs].sort((a, c) => a - c)[Math.floor(xs.length / 2)];
    const weekday = median(sim.plans.filter((p) => !p.weekend).map((p) => p.wake));
    const weekend = median(sim.plans.filter((p) => p.weekend).map((p) => p.wake));
    expect(Math.abs((b.wake.weekday ?? 0) - weekday)).toBeLessThan(20);
    expect(Math.abs((b.wake.weekend ?? 0) - weekend)).toBeLessThan(40);
    expect(b.maxStill).toBeGreaterThanOrEqual(30);
    expect(b.activeShare.mean).toBeGreaterThan(0.1);
    // 하루 요약: 출근하는 평일엔 낮에 집에 없다
    expect(dayStats(s, 1).awayHours[12]).toBe(true);
  });
});

test.describe('단계 알림', () => {
  test('사다리: 본인 → 10분 뒤 관리자 → 40분 뒤 연락처, "괜찮아요"면 멈춤', () => {
    const L = DEFAULT_LADDER;
    expect(ladderAt(0, L, null).current).toBe('self');
    expect(ladderAt(9, L, null).nextInMin).toBe(1);
    expect(ladderAt(10, L, null).current).toBe('manager');
    expect(ladderAt(40, L, null)).toMatchObject({ current: 'contact', done: true });
    expect(ladderAt(30, L, 4)).toMatchObject({ current: 'self', cancelled: true, stages: ['self'] });
    expect(ladderAt(30, L, 15)).toMatchObject({ current: 'manager', cancelled: true });
  });

  test('손으로 만든 값: 쓰러짐 표시 뒤 무활동이면 알리고, 답이 없으면 연락처까지 간다', () => {
    const m: RadarMinute[] = [];
    for (let t = 0; t < 120; t++) m.push(t < 60 ? moving(t) : { t, presence: true, motion: 1, breath: null, fall: true });
    const s = classify(m);
    const base = buildBaseline(s, 0);
    const never: Responder = () => null;
    const { incidents } = runAlerts(m, s, base, DEFAULT_THRESHOLDS, DEFAULT_LADDER, never, 0);
    expect(incidents).toHaveLength(1);
    expect(incidents[0].rule).toBe('fall');
    expect(incidents[0].t).toBe(60 + DEFAULT_THRESHOLDS.fallMin - 1);
    expect(incidents[0].outcome).toBe('contact');

    const quick: Responder = () => 3;
    const ok = runAlerts(m, s, base, DEFAULT_THRESHOLDS, DEFAULT_LADDER, quick, 0).incidents[0];
    expect(ok.outcome).toBe('ok');
    expect(ok.stages.map((x) => x.stage)).toEqual(['self']);
  });
});

test.describe('시나리오', () => {
  test('쓰러진 뒤 무활동: 천장 센서가 있으면 30분 안에, 없어도 결국 알린다', () => {
    for (const seed of [1, 2, 3]) {
      const withSensor = run('fall', seed).e;
      expect(withSensor.missed).toBe(false);
      expect(withSensor.delayMin ?? Infinity).toBeLessThan(30);
      const noSensor = run('fall', seed, false).e;
      expect(noSensor.missed).toBe(false);
      expect(noSensor.delayMin ?? Infinity).toBeGreaterThan(withSensor.delayMin ?? 0);
    }
  });

  test('장기 외출: 집에 없는 동안은 알리지 않는다', () => {
    const { p, r } = run('longAway', 4);
    const from = 17 * DAY_MIN + 600;
    const to = 19 * DAY_MIN + 1080;
    expect(r.incidents.filter((i) => i.t >= from && i.t < to)).toHaveLength(0);
    expect(p.sim.trickyDays).toEqual([17, 18, 19]);
  });

  test('늦잠: 호흡으로 거르면 헛경보가 줄어든다', () => {
    const inp = prepareMeter(14, 'normal', [11, 23, 37], 35);
    const on = meterCell(inp, DEFAULT_THRESHOLDS, DEFAULT_LADDER);
    const off = meterCell(inp, { ...DEFAULT_THRESHOLDS, useBreathing: false }, DEFAULT_LADDER);
    expect(off.falsePerWeek.oversleep).toBeGreaterThan(on.falsePerWeek.oversleep);
    expect(off.managerPerWeek).toBeGreaterThanOrEqual(on.managerPerWeek);
  });

  test('무활동 분을 줄이면 빨리 알지만 헛경보가 는다(맞바꿈)', () => {
    const inp = prepareMeter(14, 'normal', [11, 23, 37], 35);
    const short = meterCell(inp, { ...DEFAULT_THRESHOLDS, stillMin: 15 }, DEFAULT_LADDER);
    const long = meterCell(inp, { ...DEFAULT_THRESHOLDS, stillMin: 60 }, DEFAULT_LADDER);
    expect(short.falsePerWeek.normal).toBeGreaterThan(long.falsePerWeek.normal);
    expect(short.fallDelay.noSensor ?? Infinity).toBeLessThan(long.fallDelay.noSensor ?? Infinity);
  });

  test('서서히 활동 감소: 급한 알림이 아니라 주간 요약으로, 시작 뒤에 나온다', () => {
    const { e, r } = run('decline', 2);
    expect(e.noticeDelayDays).not.toBeNull();
    expect(e.noticeDelayDays ?? 99).toBeLessThan(28);
    expect(r.notices.length).toBeGreaterThan(0);
    expect(run('normal', 2).r.notices).toHaveLength(0);
  });

  test('알림 문구에 사망·진단 표현을 쓰지 않는다', () => {
    const texts = (['fall', 'oversleep', 'decline'] as const).flatMap((s) => {
      const { r } = run(s, 1);
      return [...r.incidents.map((i) => `${i.title} ${i.detail}`), ...r.notices.map((n) => `${n.title} ${n.detail}`)];
    });
    expect(texts.length).toBeGreaterThan(0);
    for (const t of texts) expect(t).not.toMatch(/사망|숨졌|고독사|진단/);
  });
});
