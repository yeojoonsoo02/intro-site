import { test, expect } from '@playwright/test';
import { createSimulator, simulateUntil, scenarioById } from '@/features/seniorcat/simulate';
import { analyze } from '@/features/seniorcat/analyze';
import { classify, detectVisits } from '@/features/seniorcat/detect';
import { identify } from '@/features/seniorcat/identify';
import { DAY_S, type ScenarioId, type Sample } from '@/features/seniorcat/types';

// 노령묘 화장실 센서 데모의 알고리즘 점검. 브라우저 없이 함수만 본다.
// 시뮬레이터는 시드가 같으면 같은 신호를 만들어서, 정답과 비교한 수치가 흔들리지 않는다.

function run(scenario: ScenarioId, seed: number, days: number) {
  const sc = scenarioById(scenario);
  const config = { scenario, cats: sc.cats, noiseG: 8, drift: true, seed };
  const simDays = simulateUntil(createSimulator(config), days);
  return analyze(simDays, config, { baselineDays: 21, useStay: false });
}

test.describe('방문 검출', () => {
  test('손으로 만든 신호: 들어옴·나감·모래 무게 변화를 잡는다', () => {
    const s: Sample[] = [];
    let t = 0;
    for (; t < 60; t++) s.push({ t, w: 5000 });
    for (let i = 0; i < 40; i++, t++) s.push({ t, w: 5000 + 4000 }); // 가만히 40초(소변 자세)
    for (let i = 0; i < 40; i++, t++) s.push({ t, w: 5030 }); // 나간 뒤 +30g
    const { visits } = detectVisits(s);
    expect(visits).toHaveLength(1);
    expect(visits[0].start).toBe(60);
    expect(visits[0].stayS).toBe(40);
    expect(Math.round(visits[0].deltaG)).toBe(30);
    expect(Math.round(visits[0].catWeightG)).toBe(4000);
    expect(visits[0].elim).toBe('urine');
  });

  test('배설 종류: 무게 변화가 없으면 "배설 없음", 끊긴 멈춤이 이어지면 대변', () => {
    expect(classify(2, 40, 1)).toBe('none');
    expect(classify(25, 30, 1)).toBe('urine');
    expect(classify(20, 9, 4)).toBe('feces');
  });

  test('시뮬레이션 30일: 방문을 거의 다 찾고 종류를 90% 넘게 맞힌다', () => {
    const a = run('normal', 3, 30);
    const e = a.evaluation;
    expect(e.matched / e.trueVisits).toBeGreaterThan(0.98);
    expect(e.elimCorrect / e.matched).toBeGreaterThan(0.9);
    expect(e.weightMaeG).toBeLessThan(40);
  });
});

test.describe('고양이 구분', () => {
  test('체중이 확실히 다르면 모두 구분하고, 비슷하면 "구분 어려움"을 남긴다', () => {
    const far = run('normal', 1, 21).evaluation;
    expect(far.assigned / far.matched).toBeGreaterThan(0.98);
    expect(far.idCorrect / far.assigned).toBeGreaterThan(0.98);

    const near = run('similar', 1, 21).evaluation;
    expect(near.assigned).toBeLessThan(near.matched); // 일부는 정하지 않는다
    expect(near.idCorrect / near.assigned).toBeGreaterThan(0.9);
  });

  test('어느 고양이와도 먼 무게는 모르는 무게로 둔다', () => {
    const base = { id: 1, start: 0, end: 30, stayS: 30, preG: 5000, postG: 5000, deltaG: 0, stillS: 20, elim: 'none' as const };
    const [v] = identify([{ ...base, catWeightG: 8000 }], scenarioById('normal').cats, { useStay: false, noiseG: 8 });
    expect(v.unknown).toBe(true);
    expect(v.catId).toBeNull();
  });
});

test.describe('알림', () => {
  test('소변이 안 나오는 방문이 이어지면 몇 시간 안에 급한 변화 알림', () => {
    const a = run('noUrine', 2, 40);
    const e = a.evaluation;
    expect(e.delayS).not.toBeNull();
    expect(e.delayS ?? Infinity).toBeLessThan(6 * 3600);
    expect(a.alerts.some((x) => x.kind === 'urgent' && x.catId === 'B')).toBe(true);
  });

  test('소변이 늘면 느린 변화 알림이 그 고양이에게, 변화 시작 뒤에 뜬다', () => {
    const a = run('polyuria', 2, 70);
    const e = a.evaluation;
    expect(e.delayS).not.toBeNull();
    expect((e.delayS ?? 0) / DAY_S).toBeLessThan(30);
  });

  test('알림 문구에 병 이름을 결론처럼 쓰지 않는다', () => {
    const texts = (['polyuria', 'weightLoss', 'noUrine'] as const).flatMap((s) => run(s, 1, 70).alerts.map((a) => `${a.title} ${a.detail}`));
    expect(texts.length).toBeGreaterThan(0);
    for (const t of texts) expect(t).not.toMatch(/신장병|당뇨|갑상선|요로결석|진단/);
  });
});
