'use client';

import { useEffect, useMemo, useState } from 'react';
import { CAT_IDS, DAY_S, type CatConfig, type CatId, type ScenarioId, type SimConfig } from './types';
import { SCENARIOS, createSimulator, scenarioById, simulateUntil } from './simulate';
import { METRICS, analyze, when } from './analyze';
import { CONFIDENT, closePairs } from './identify';
import { ChartLegend, DailyChart, SignalChart, VisitChart, hm } from './charts';
import Report from './Report';

// 화장실 무게 센서 웹 데모. 전부 브라우저에서 돈다(서버·키 없음).
// 시뮬레이터가 무게 신호를 만들고 → 방문 검출 → 체중으로 고양이 구분 → 고양이별 기준선 → 알림.
// 시뮬레이터의 정답은 알고리즘이 보지 않고, 맨 아래 "정답과 비교"에만 쓴다.

const MAX_DAYS = 120;
const PREFS_KEY = 'seniorcat-demo-prefs';
const NOISE: { g: number; label: string }[] = [
  { g: 3, label: '낮음 (±3g)' },
  { g: 8, label: '보통 (±8g)' },
  { g: 20, label: '높음 (±20g)' },
];
const BASELINE_OPTIONS = [14, 21, 28];
const NAMES = ['보리', '두부', '콩이'];
const EXTRA: CatConfig[] = [
  { id: 'A', name: '보리', weightG: 3600, male: false },
  { id: 'B', name: '두부', weightG: 4400, male: true },
  { id: 'C', name: '콩이', weightG: 4200, male: false },
];

interface Prefs {
  scenario: ScenarioId;
  baselineDays: number;
  useStay: boolean;
}

function loadPrefs(): Partial<Prefs> {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    return raw ? (JSON.parse(raw) as Partial<Prefs>) : {};
  } catch {
    return {};
  }
}

function savePrefs(p: Prefs): void {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  } catch {
    // 저장소가 막혀 있으면 기억하지 않는다
  }
}

const H2 = 'text-[20px] font-semibold';
const H2_STYLE = { fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)' } as const;
const ELIM_LABEL = { urine: '소변 추정', feces: '대변 추정', none: '배설 없음' } as const;

export default function CatDemo(): JSX.Element {
  const [scenario, setScenario] = useState<ScenarioId>('normal');
  const [cats, setCats] = useState<CatConfig[]>(SCENARIOS[0].cats);
  const [noiseG, setNoiseG] = useState(8);
  const [drift, setDrift] = useState(true);
  const [seed, setSeed] = useState(7);
  const [baselineDays, setBaselineDays] = useState(21);
  const [useStay, setUseStay] = useState(false);
  const [day, setDay] = useState(0);
  const [catTab, setCatTab] = useState<CatId>('A');
  const [viewDay, setViewDay] = useState<number | null>(null);
  const [visitId, setVisitId] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // 저장해 둔 설정(시나리오·기준선 기간·머문 시간 사용) — 사소한 것만
  useEffect(() => {
    const p = loadPrefs();
    const sc = SCENARIOS.find((s) => s.id === p.scenario);
    if (sc) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 때 한 번, 저장소에서 읽은 뒤 저장을 켠다(서버 HTML과 첫 화면을 맞추기 위해)
      setScenario(sc.id);
      setCats(sc.cats);
    }
    if (p.baselineDays && BASELINE_OPTIONS.includes(p.baselineDays)) setBaselineDays(p.baselineDays);
    if (typeof p.useStay === 'boolean') setUseStay(p.useStay);
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) savePrefs({ scenario, baselineDays, useStay });
  }, [loaded, scenario, baselineDays, useStay]);

  const config: SimConfig = useMemo(() => ({ scenario, cats, noiseG, drift, seed }), [scenario, cats, noiseG, drift, seed]);

  // 시뮬레이터는 설정이 바뀔 때만 새로 만들고, 날을 넘기면 이어서 만든다(앞날은 그대로)
  const sim = useMemo(() => createSimulator(config), [config]);
  const days = useMemo(() => simulateUntil(sim, day), [sim, day]);

  const analysis = useMemo(() => analyze(days, config, { baselineDays, useStay }), [days, config, baselineDays, useStay]);

  // 재생: 하루씩 넘긴다(동작 줄이기 설정이면 일주일씩, 덜 자주)
  useEffect(() => {
    if (!playing) return;
    let reduce = false;
    try {
      reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      reduce = false;
    }
    const id = window.setInterval(
      () => {
        setDay((d) => {
          const next = Math.min(MAX_DAYS, d + (reduce ? 7 : 1));
          if (next >= MAX_DAYS) setPlaying(false);
          return next;
        });
      },
      reduce ? 900 : 260,
    );
    return () => window.clearInterval(id);
  }, [playing]);

  const advance = (n: number): void => {
    setDay((d) => Math.min(MAX_DAYS, d + n));
    setViewDay(null);
    setVisitId(null);
  };
  const reset = (): void => {
    setPlaying(false);
    setDay(0);
    setViewDay(null);
    setVisitId(null);
  };
  const pickScenario = (id: ScenarioId): void => {
    const sc = scenarioById(id);
    setScenario(id);
    setCats(sc.cats);
    setCatTab(sc.target !== null ? sc.cats[sc.target].id : 'A');
    setVisitId(null);
  };
  const setCatCount = (n: number): void => {
    setCats((prev) => {
      if (n <= prev.length) return prev.slice(0, n);
      const out = [...prev];
      for (let i = prev.length; i < n; i++) out.push({ ...EXTRA[i], id: CAT_IDS[i], name: NAMES[i] });
      return out;
    });
    if (CAT_IDS.indexOf(catTab) >= n) setCatTab('A');
  };
  const updateCat = (id: CatId, patch: Partial<CatConfig>): void => setCats((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const sc = scenarioById(scenario);
  const tab = cats.find((c) => c.id === catTab) ?? cats[0];
  const rows = analysis.rows[tab.id] ?? [];
  const baseline = analysis.baselines[tab.id] ?? null;
  const traces = analysis.traces[tab.id];
  const urgent = analysis.alerts.filter((a) => a.kind === 'urgent');
  const shownDay = viewDay ?? Math.max(0, day - 1);
  const daySamples = day > 0 ? days[shownDay]?.samples ?? [] : [];
  const dayVisits = analysis.visits.filter((v) => Math.floor(v.start / DAY_S) === shownDay);
  const visit = analysis.visits.find((v) => v.id === visitId) ?? null;
  const pairs = closePairs(cats);
  const ev = analysis.evaluation;
  const pct = (a: number, b: number): string => (b ? `${Math.round((100 * a) / b)}%` : '—');
  const catName = (id: CatId | null): string => cats.find((c) => c.id === id)?.name ?? '구분 어려움';
  const ambiguousShare = analysis.visits.length ? analysis.ambiguous / analysis.visits.length : 0;
  const latestAlert = analysis.alerts[0];

  return (
    <div className="grid gap-10 md:grid-cols-[300px_minmax(0,1fr)] md:gap-12">
      {/* 날 넘기기 — 폰에서도 맨 위에 오게 두 칸을 가로지른다 */}
      <section aria-labelledby="time-title" className="md:col-span-2 grid gap-3 p-5 rounded-[var(--r-lg)] cat-report-noprint" style={{ background: 'var(--surface)', border: '1px solid var(--rule)', boxShadow: 'var(--shadow)' }}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="time-title" className="text-[17px] font-semibold" style={{ color: 'var(--ink)' }}>
            {day}일 기록됨
          </h2>
          <span className="meta" style={{ color: 'var(--accent)' }}>
            시뮬레이션 데이터
          </span>
        </div>
        <p className="text-[14px] leading-[1.55]" style={{ color: 'var(--ink-2)' }} role="status">
          {day < baselineDays
            ? `평소 기준선을 만드는 중입니다(${day}/${baselineDays}일). 이 기간엔 느린 변화 알림을 내지 않습니다.`
            : `기준선 완성. 방문 ${analysis.visits.length}번, 알림 ${analysis.alerts.length}개${latestAlert ? ` · 최근: ${latestAlert.title}` : ''}.`}
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={() => advance(1)} disabled={day >= MAX_DAYS}>
            +1일
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => advance(7)} disabled={day >= MAX_DAYS}>
            +7일
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => advance(30)} disabled={day >= MAX_DAYS}>
            +30일
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setPlaying((p) => !p)} aria-pressed={playing} disabled={day >= MAX_DAYS}>
            {playing ? '멈춤' : '재생'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={reset}>
            처음부터
          </button>
        </div>
        {sc.onsetDay !== null && (
          <p className="meta">
            이 시나리오의 변화는 {sc.onsetDay + 1}일째{sc.id === 'noUrine' ? ' 07시' : ''}에 시작됩니다(알고리즘은 모름).
          </p>
        )}
      </section>
      {/* 왼쪽: 설정 */}
      <div className="grid gap-8 content-start cat-report-noprint">
        <fieldset className="m-0 p-0 border-0 min-w-0">
          <legend className="meta mb-2">시나리오</legend>
          <div className="grid gap-1.5">
            {SCENARIOS.map((s) => (
              <label key={s.id} className="relative block">
                <input type="radio" name="scenario" value={s.id} checked={scenario === s.id} onChange={() => pickScenario(s.id)} className="peer sr-only" />
                <span
                  className="block px-3 py-2.5 rounded-[var(--r-md)] cursor-pointer peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
                  style={{
                    border: `1px solid ${scenario === s.id ? 'var(--accent)' : 'var(--rule)'}`,
                    background: scenario === s.id ? 'var(--accent-soft)' : 'var(--surface)',
                    outlineColor: 'var(--accent)',
                  }}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-[15px] font-semibold" style={{ color: scenario === s.id ? 'var(--accent)' : 'var(--ink)' }}>
                      {s.label}
                    </span>
                    <span className="meta" style={{ fontSize: '11.5px' }}>
                      {s.speed}
                    </span>
                  </span>
                </span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-[13.5px] leading-[1.55]" style={{ color: 'var(--ink-2)' }}>
            {sc.summary}
          </p>
        </fieldset>

        <fieldset className="m-0 p-0 border-0 min-w-0 grid gap-3">
          <legend className="meta mb-2">고양이 (등록 체중)</legend>
          <label className="grid gap-1">
            <span className="text-[14px]" style={{ color: 'var(--ink-2)' }}>
              마릿수
            </span>
            <select value={cats.length} onChange={(e) => setCatCount(Number(e.target.value))}>
              {[1, 2, 3].map((n) => (
                <option key={n} value={n}>
                  {n}마리
                </option>
              ))}
            </select>
          </label>
          {cats.map((c) => (
            <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_6.5rem] gap-2 items-end">
              <label className="grid gap-1 min-w-0">
                <span className="text-[14px] font-semibold" style={{ color: 'var(--ink)' }}>
                  {c.name} 체중(kg)
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={2}
                  max={9}
                  step={0.05}
                  value={(c.weightG / 1000).toFixed(2)}
                  onChange={(e) => {
                    const kg = Number(e.target.value);
                    if (Number.isFinite(kg) && kg >= 2 && kg <= 9) updateCat(c.id, { weightG: Math.round(kg * 1000) });
                  }}
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[14px]" style={{ color: 'var(--ink-2)' }}>
                  성별
                </span>
                <select value={c.male ? 'm' : 'f'} onChange={(e) => updateCat(c.id, { male: e.target.value === 'm' })}>
                  <option value="f">암컷</option>
                  <option value="m">수컷</option>
                </select>
              </label>
            </div>
          ))}
          {pairs.length > 0 && (
            <p className="text-[13.5px] leading-[1.55] pl-3" style={{ borderLeft: '3px solid var(--accent)', color: 'var(--ink)' }}>
              {pairs.map(([a, b]) => `${a.name}·${b.name}`).join(', ')}의 체중 차이가 0.3kg 안쪽입니다. 체중만으로는 구분이 어려운 방문이 생깁니다.
            </p>
          )}
        </fieldset>

        <fieldset className="m-0 p-0 border-0 min-w-0 grid gap-3">
          <legend className="meta mb-2">센서·알고리즘</legend>
          <label className="grid gap-1">
            <span className="text-[14px]" style={{ color: 'var(--ink-2)' }}>
              로드셀 잡음
            </span>
            <select value={noiseG} onChange={(e) => setNoiseG(Number(e.target.value))}>
              {NOISE.map((n) => (
                <option key={n.g} value={n.g}>
                  {n.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-[14px]" style={{ color: 'var(--ink-2)' }}>
              기준선 기간
            </span>
            <select value={baselineDays} onChange={(e) => setBaselineDays(Number(e.target.value))}>
              {BASELINE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  처음 {n}일
                </option>
              ))}
            </select>
          </label>
          <Check id="drift" label="모래 무게 천천히 변함" hint="소변 덩어리 증발·습기(하루 ±6g)" checked={drift} onChange={setDrift} />
          <Check id="stay" label="머문 시간도 써서 구분" hint="체중 + 소변 볼 때 머무는 시간 버릇" checked={useStay} onChange={setUseStay} />
          <div className="flex items-center gap-2">
            <span className="meta">시드 {seed}</span>
            <button type="button" className="btn btn-ghost" onClick={() => setSeed((s) => (s * 48271) % 2147483647 || 7)}>
              다른 시드로
            </button>
          </div>
        </fieldset>
      </div>

      {/* 오른쪽: 결과 */}
      <div className="grid gap-12 content-start min-w-0">

        <section aria-labelledby="alerts-title" className="grid gap-3 min-w-0 cat-report-noprint">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="alerts-title" className={H2} style={H2_STYLE}>
              알림
            </h2>
            <span className="meta">
              급한 변화 {urgent.length} · 느린 변화 {analysis.alerts.length - urgent.length}
            </span>
          </div>
          {analysis.alerts.length === 0 ? (
            <p className="text-[15px]" style={{ color: 'var(--muted)' }}>
              아직 알림이 없습니다. {day === 0 ? '위에서 날을 넘겨 보세요.' : '평소와 다른 점이 보이면 여기에 뜹니다.'}
            </p>
          ) : (
            <ul className="list-none m-0 p-0 grid gap-3" aria-live="polite">
              {analysis.alerts.slice(0, 8).map((a) => (
                <li
                  key={a.id}
                  className="pl-4 py-1 grid gap-1"
                  style={{ borderLeft: a.kind === 'urgent' ? '3px solid var(--accent)' : '1px solid var(--rule)' }}
                >
                  <p className="meta" style={{ color: a.kind === 'urgent' ? 'var(--accent)' : 'var(--muted)' }}>
                    {a.kind === 'urgent' ? '급한 변화' : '느린 변화 · 검진 권유'} · {when(a.t)}
                  </p>
                  <p className="text-[16px] font-semibold leading-[1.45]" style={{ color: 'var(--ink)' }}>
                    {a.title}
                  </p>
                  <p className="text-[14.5px] leading-[1.6]" style={{ color: 'var(--ink-2)' }}>
                    {a.detail}
                  </p>
                </li>
              ))}
              {analysis.alerts.length > 8 && <li className="meta">이전 알림 {analysis.alerts.length - 8}개는 리포트에 있습니다.</li>}
            </ul>
          )}
        </section>

        <section aria-labelledby="daily-title" className="grid gap-4 min-w-0 cat-report-noprint">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <h2 id="daily-title" className={H2} style={H2_STYLE}>
              고양이별 하루 기록
            </h2>
            <div role="radiogroup" aria-label="고양이 고르기" className="flex gap-1.5">
              {cats.map((c) => (
                <label key={c.id} className="relative">
                  <input type="radio" name="cat-tab" value={c.id} checked={tab.id === c.id} onChange={() => setCatTab(c.id)} className="peer sr-only" />
                  <span
                    className="inline-flex items-center min-h-[40px] px-3 rounded-[var(--r-md)] text-[14px] font-semibold cursor-pointer peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
                    style={{
                      border: `1px solid ${tab.id === c.id ? 'var(--accent)' : 'var(--rule)'}`,
                      background: tab.id === c.id ? 'var(--accent-soft)' : 'var(--surface)',
                      color: tab.id === c.id ? 'var(--accent)' : 'var(--ink)',
                      outlineColor: 'var(--accent)',
                    }}
                  >
                    {c.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <ChartLegend />
          <div className="grid gap-6 sm:grid-cols-2">
            {METRICS.map((m) => (
              <DailyChart
                key={m.id}
                id={`daily-${m.id}`}
                label={m.label}
                unit={m.unit}
                digits={m.digits}
                rows={rows}
                metric={m.id}
                baseline={baseline}
                baselineDays={baselineDays}
                mean7={traces?.[m.id].mean7}
                alertDays={analysis.alerts.filter((a) => a.catId === tab.id && a.metric === m.id).map((a) => Math.floor(a.t / DAY_S))}
                span={Math.max(day, 42)}
              />
            ))}
          </div>
          <p className="text-[13.5px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
            구분이 애매한 방문은 고양이별 확률만큼 나눠 셉니다. 체중은 {Math.round(CONFIDENT * 100)}% 넘게 확실한 방문만 씁니다. 느린 변화 알림은 누적합(CUSUM)이
            문턱을 넘고 최근 7일 평균이 기준선에서 충분히 벗어났을 때만 냅니다.
          </p>
        </section>

        <section aria-labelledby="signal-title" className="grid gap-3 min-w-0 cat-report-noprint">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <h2 id="signal-title" className={H2} style={H2_STYLE}>
              센서 원신호
            </h2>
            {day > 0 && (
              <label className="flex items-center gap-2">
                <span className="meta">날짜</span>
                <select
                  value={shownDay}
                  onChange={(e) => {
                    setViewDay(Number(e.target.value));
                    setVisitId(null);
                  }}
                >
                  {Array.from({ length: day }, (_, d) => day - 1 - d).map((d) => (
                    <option key={d} value={d}>
                      {d + 1}일째
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          {day === 0 ? (
            <p className="text-[15px]" style={{ color: 'var(--muted)' }}>
              날을 넘기면 그날 저울이 보낸 값이 그려집니다.
            </p>
          ) : (
            <>
              <div className="hidden sm:block">
                <SignalChart day={shownDay} samples={daySamples} visits={dayVisits} selected={visitId} />
              </div>
              <div className="sm:hidden">
                <SignalChart day={shownDay} samples={daySamples} visits={dayVisits} selected={visitId} w={360} />
              </div>
              {visit ? (
                <div className="grid gap-2">
                  <div className="hidden sm:block">
                    <VisitChart visit={visit} samples={days[Math.floor(visit.start / DAY_S)]?.samples ?? []} />
                  </div>
                  <div className="sm:hidden">
                    <VisitChart visit={visit} samples={days[Math.floor(visit.start / DAY_S)]?.samples ?? []} w={360} />
                  </div>
                  <p className="text-[13.5px] leading-[1.6]" style={{ color: 'var(--ink-2)' }}>
                    고양이가 안에 있는 동안은 소변이 몸에서 모래로 옮겨 갈 뿐이라 총무게가 같습니다. 그래서 배설량은 나온 뒤 안정된 모래 무게에서 들어가기
                    전 무게를 빼서 잽니다. 가장 오래 가만히 있던 구간 {visit.stillS}초 — 한 번 길게 멈추면 소변, 멈췄다 힘주기를 반복하면 대변으로 봅니다.
                  </p>
                </div>
              ) : (
                <p className="meta">아래 표의 시각을 누르면 그 방문을 여기서 확대합니다.</p>
              )}
              <div className="overflow-auto max-h-[380px] scrollbar-thin" tabIndex={0} role="region" aria-label={`${shownDay + 1}일째 방문 목록`}>
                <table className="w-full border-collapse text-[14px] leading-[1.5] min-w-[540px]">
                  <caption className="sr-only">{shownDay + 1}일째 찾은 방문</caption>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--ink-2)', position: 'sticky', top: 0, background: 'var(--paper)' }}>
                      {['시각', '누구(확률)', '머문 시간', '체중', '모래 변화', '추정'].map((h) => (
                        <th key={h} scope="col" className="text-left font-normal py-1.5 pr-2 meta">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dayVisits.map((v) => (
                      <tr key={v.id} style={{ borderBottom: '1px solid var(--rule)', background: v.id === visitId ? 'var(--accent-soft)' : undefined }}>
                        <td className="py-1 pr-2">
                          <button
                            type="button"
                            className="link-u min-h-[36px] min-w-0 text-left"
                            style={{ color: 'var(--ink)' }}
                            onClick={() => setVisitId(v.id === visitId ? null : v.id)}
                            aria-pressed={v.id === visitId}
                            aria-label={`${hm(v.start)} 방문 확대해서 보기`}
                          >
                            {hm(v.start)}
                          </button>
                        </td>
                        <td className="py-1 pr-2" style={{ color: v.catId ? 'var(--ink)' : 'var(--accent)' }}>
                          {v.unknown ? '모르는 무게' : v.catId ? `${catName(v.catId)} ${Math.round(v.confidence * 100)}%` : `구분 어려움 (${catName(v.bestId)} ${Math.round(v.confidence * 100)}%)`}
                        </td>
                        <td className="py-1 pr-2" style={{ color: 'var(--ink-2)' }}>
                          {v.stayS}초
                        </td>
                        <td className="py-1 pr-2" style={{ color: 'var(--ink-2)' }}>
                          {(v.catWeightG / 1000).toFixed(2)}kg
                        </td>
                        <td className="py-1 pr-2" style={{ color: 'var(--ink-2)' }}>
                          {v.deltaG >= 0 ? '+' : ''}
                          {v.deltaG.toFixed(1)}g
                        </td>
                        <td className="py-1" style={{ color: 'var(--ink)' }}>
                          {ELIM_LABEL[v.elim]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <section aria-labelledby="eval-title" className="grid gap-3 min-w-0 cat-report-noprint">
          <h2 id="eval-title" className={H2} style={H2_STYLE}>
            시뮬레이터 정답과 비교
          </h2>
          <p className="text-[14px] leading-[1.6]" style={{ color: 'var(--ink-2)' }}>
            알고리즘은 무게 신호만 봅니다. 시뮬레이터는 누가 언제 무엇을 했는지 알고 있어서, 연구 질문 두 가지를 여기서 미리 재 볼 수 있습니다. 실제
            고양이에서는 카메라로 붙인 정답이 필요합니다.
          </p>
          <dl className="m-0 grid gap-x-6 gap-y-3 grid-cols-2 sm:grid-cols-3">
            <Stat label="방문 검출" value={pct(ev.matched, ev.trueVisits)} sub={`${ev.matched}/${ev.trueVisits}번`} />
            <Stat label="배설 종류 맞힘" value={pct(ev.elimCorrect, ev.matched)} sub="소변·대변·없음" />
            <Stat label="체중 오차" value={ev.matched ? `${Math.round(ev.weightMaeG)}g` : '—'} sub="방문당 평균" />
            <Stat label="고양이 구분됨" value={pct(ev.assigned, ev.matched)} sub={`나머지는 구분 어려움`} />
            <Stat label="구분한 것 중 맞음" value={pct(ev.idCorrect, ev.assigned)} sub={`확률 ${Math.round(CONFIDENT * 100)}% 이상만`} />
            <Stat
              label="변화를 잡기까지"
              value={ev.delayS === null ? (ev.onsetT === null ? '해당 없음' : day * DAY_S < ev.onsetT ? '시작 전' : '아직') : ev.delayS < 2 * DAY_S ? `${(ev.delayS / 3600).toFixed(1)}시간` : `${Math.round(ev.delayS / DAY_S)}일`}
              sub={`엉뚱한 알림 ${ev.falseAlerts}개`}
            />
          </dl>
        </section>

        <section aria-labelledby="report-heading" className="grid gap-3 min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 cat-report-noprint">
            <h2 id="report-heading" className={H2} style={H2_STYLE}>
              병원에 가져갈 리포트
            </h2>
            <button type="button" className="btn btn-ghost" onClick={() => window.print()} disabled={day === 0}>
              인쇄 · PDF로 저장
            </button>
          </div>
          <p className="text-[14px] leading-[1.6] cat-report-noprint" style={{ color: 'var(--ink-2)' }}>
            고른 고양이({tab.name}) 한 마리를 한 쪽에 담습니다. 인쇄하면 이 리포트만 나옵니다.
          </p>
          <Report cat={tab} rows={rows} baseline={baseline} baselineDays={baselineDays} traces={traces} alerts={analysis.alerts} ambiguousShare={ambiguousShare} />
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }): JSX.Element {
  return (
    <div className="pl-3 min-w-0" style={{ borderLeft: '1px solid var(--rule)' }}>
      <dt className="meta">{label}</dt>
      <dd className="m-0">
        <span className="block text-[22px] font-semibold leading-tight" style={{ color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </span>
        <span className="block text-[12.5px]" style={{ color: 'var(--muted)' }}>
          {sub}
        </span>
      </dd>
    </div>
  );
}

function Check({ id, label, hint, checked, onChange }: { id: string; label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }): JSX.Element {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        aria-describedby={`${id}-hint`}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 min-h-0 shrink-0 p-0 cursor-pointer"
        style={{ accentColor: 'var(--accent)' }}
      />
      <div className="min-w-0">
        <label htmlFor={id} className="block text-[15px] font-semibold cursor-pointer" style={{ color: 'var(--ink)' }}>
          {label}
        </label>
        <p id={`${id}-hint`} className="text-[13px] leading-[1.5]" style={{ color: 'var(--muted)' }}>
          {hint}
        </p>
      </div>
    </div>
  );
}
