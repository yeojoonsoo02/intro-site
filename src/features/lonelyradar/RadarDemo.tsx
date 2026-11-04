'use client';

import { useEffect, useMemo, useState } from 'react';
import { DAY_MIN, type Noise, type ScenarioId, type Thresholds, type TruthState } from './types';
import { SCENARIOS, scenarioById } from './simulate';
import { STATE_LABEL, expectedWake } from './detect';
import { DEFAULT_LADDER, DEFAULT_THRESHOLDS, RULE_LABEL, STAGE_LABEL, hm, when } from './alerts';
import { SWEEP_VALUES, alertsFor, evaluateRun, meterCell, prepare, prepareMeter, sweep, type MeterCell, type MeterInputs, type SweepParam } from './evaluate';
import { DayTimeline, RhythmStrip, StateLegend, dayLabel } from './charts';
import LadderPractice from './LadderPractice';

// 1인가구 생활 리듬 레이더 웹 데모. 전부 브라우저에서 돈다(서버·키 없음).
// 시뮬레이터가 레이더 키트의 1분 값을 만들고 → 상태 머신 → 개인 기준선 → 이탈 규칙 → 단계 알림.
// 시뮬레이터의 정답(실제로 자는 중인지, 쓰러졌는지)은 알고리즘이 보지 않고 "정답과 비교"·헛경보 미터에만 쓴다.

const DAYS = 42;
const PREFS_KEY = 'lonelyradar-demo-prefs';
const LADDER = DEFAULT_LADDER;
const NOISES: { id: Noise; label: string }[] = [
  { id: 'low', label: '낮음' },
  { id: 'normal', label: '보통' },
  { id: 'high', label: '높음 (커튼·선풍기·유리 너머)' },
];
const BASELINE_OPTIONS = [7, 14, 21];
/** 처음 열면 바로 보이게 고르는 예시 시나리오(쓰러진 날로 바로 가서 단계 알림이 보인다) */
const SHOWCASE: ScenarioId = 'fall';
const TRUTH_LABEL: Record<TruthState, string> = { away: '집에 없음', active: '움직이는 중', rest: '쉬는 중', sleep: '자는 중', fallen: '쓰러짐' };
const SWEEP_LABEL: Record<SweepParam, { label: string; unit: string }> = {
  graceMin: { label: '여유 시간', unit: '분' },
  stillMin: { label: '무활동 분', unit: '분' },
  fallMin: { label: '쓰러짐 후 기다림', unit: '분' },
};

interface Prefs {
  scenario: ScenarioId;
  sweepParam: SweepParam;
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
const f1 = (v: number): string => v.toFixed(v >= 10 ? 0 : 1);
const mins = (v: number | null): string => (v === null ? '—' : v >= 120 ? `${(v / 60).toFixed(1)}시간` : `${Math.round(v)}분`);

export default function RadarDemo(): JSX.Element {
  const [scenario, setScenario] = useState<ScenarioId>('normal');
  const [seed, setSeed] = useState(7);
  const [noise, setNoise] = useState<Noise>('normal');
  const [fallSensor, setFallSensor] = useState(true);
  const [baselineDays, setBaselineDays] = useState(14);
  const [graceMin, setGraceMin] = useState(DEFAULT_THRESHOLDS.graceMin);
  const [stillMin, setStillMin] = useState(DEFAULT_THRESHOLDS.stillMin);
  const [fallMin, setFallMin] = useState(DEFAULT_THRESHOLDS.fallMin);
  const [useBreathing, setUseBreathing] = useState(DEFAULT_THRESHOLDS.useBreathing);
  const [pickedDay, setPickedDay] = useState<number | null>(null);
  const [sweepParam, setSweepParam] = useState<SweepParam>('graceMin');
  const [loaded, setLoaded] = useState(false);
  const [showcase, setShowcase] = useState(false);
  const [meterInputs, setMeterInputs] = useState<MeterInputs | null>(null);
  const [meter, setMeter] = useState<{ key: string; cell: MeterCell; rows: { value: number; cell: MeterCell }[] } | null>(null);

  useEffect(() => {
    const p = loadPrefs();
    // 예시 자동 실행: 기억해 둔 시나리오가 '정상 생활'이 아니면 그걸, 아니면 SHOWCASE(쓰러진 뒤 무활동)를 고른다
    const saved = SCENARIOS.find((s) => s.id === p.scenario && s.id !== 'normal');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 때 한 번, 저장소에서 읽은 뒤 저장을 켠다(서버 HTML과 첫 화면을 맞추기 위해)
    setScenario(saved?.id ?? SHOWCASE);
    setShowcase(true);
    if (p.sweepParam && p.sweepParam in SWEEP_VALUES) setSweepParam(p.sweepParam);
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) savePrefs({ scenario, sweepParam });
  }, [loaded, scenario, sweepParam]);

  const th: Thresholds = useMemo(() => ({ graceMin, stillMin, fallMin, useBreathing }), [graceMin, stillMin, fallMin, useBreathing]);

  // 시뮬레이션 → 상태 → 기준선은 문턱값과 상관없다. 문턱값이 바뀌면 규칙만 다시 돈다.
  const prepared = useMemo(() => prepare({ scenario, days: DAYS, seed, fallSensor, noise }, baselineDays), [scenario, seed, fallSensor, noise, baselineDays]);
  const result = useMemo(() => alertsFor(prepared, th, LADDER), [prepared, th]);
  const ev = useMemo(() => evaluateRun(prepared, result), [prepared, result]);

  // 헛경보 미터: 시나리오 5개 × 시드 6개 × 42일을 따로 만들어 잰다. 무거워서 화면을 먼저 그린 뒤 계산한다.
  useEffect(() => {
    const id = window.setTimeout(() => setMeterInputs(prepareMeter(baselineDays, noise)), 40);
    return () => window.clearTimeout(id);
  }, [baselineDays, noise]);
  const meterKey = `${baselineDays}|${noise}|${graceMin}|${stillMin}|${fallMin}|${useBreathing}|${sweepParam}`;
  useEffect(() => {
    if (!meterInputs) return;
    const id = window.setTimeout(() => {
      setMeter({ key: meterKey, cell: meterCell(meterInputs, th, LADDER), rows: sweep(meterInputs, th, LADDER, sweepParam) });
    }, 250);
    return () => window.clearTimeout(id);
  }, [meterInputs, th, sweepParam, meterKey]);
  const meterStale = !meter || meter.key !== meterKey || meterInputs?.baselineDays !== baselineDays;

  const sc = scenarioById(scenario);
  const { sim, states, baseline } = prepared;
  const { incidents, notices } = result;
  const firstIncidentDay = incidents.length ? Math.floor(incidents[0].t / DAY_MIN) : null;
  const defaultDay = sim.emergencyT !== null ? Math.floor(sim.emergencyT / DAY_MIN) : (firstIncidentDay ?? sim.trickyDays[0] ?? DAYS - 1);
  const day = Math.min(DAYS - 1, Math.max(0, pickedDay ?? defaultDay));
  const expectedWakes = Array.from({ length: DAYS }, (_, d) => expectedWake(baseline, d));
  const dayIncidents = incidents.filter((i) => Math.floor(i.t / DAY_MIN) === day);
  const managerCount = incidents.filter((i) => i.stages.some((s) => s.stage === 'manager')).length;
  const contactCount = incidents.filter((i) => i.outcome === 'contact').length;

  const pickScenario = (id: ScenarioId): void => {
    setShowcase(false);
    setScenario(id);
    setPickedDay(null);
  };

  return (
    <div className="grid gap-10 md:grid-cols-[300px_minmax(0,1fr)] md:gap-12">
      <section
        aria-labelledby="run-title"
        className="md:col-span-2 grid gap-2 p-5 rounded-[var(--r-lg)]"
        style={{ background: 'var(--surface)', border: '1px solid var(--rule)', boxShadow: 'var(--shadow)' }}
      >
        {showcase && (
          <p className="m-0 mb-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] pl-3" style={{ color: 'var(--ink-2)', borderLeft: '3px solid var(--accent)' }}>
            <span>예시 시나리오 자동 실행됨 · {sc.label} · 알림이 난 날을 펼쳐 두었습니다</span>
            <button type="button" className="link-u text-[13.5px] font-semibold" style={{ color: 'var(--accent)' }} onClick={() => pickScenario('normal')}>
              정상 생활로 바꿔 보기
            </button>
          </p>
        )}
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="run-title" className="text-[17px] font-semibold" style={{ color: 'var(--ink)' }}>
            {sc.label} · {DAYS}일
          </h2>
          <span className="meta" style={{ color: 'var(--accent)' }}>
            시뮬레이션 데이터
          </span>
        </div>
        <p className="text-[14px] leading-[1.55]" style={{ color: 'var(--ink-2)' }}>
          {sc.summary}
        </p>
        <p className="text-[14.5px] leading-[1.55]" style={{ color: 'var(--ink)' }} role="status">
          처음 {baselineDays}일은 기준선만 만들고 알리지 않습니다. 그 뒤 {DAYS - baselineDays}일 동안 알림 {incidents.length}번
          {incidents.length > 0 && ` (관리자까지 ${managerCount}번 · 연락처까지 ${contactCount}번)`}, 활동 감소 요약 {notices.length}번.
        </p>
      </section>

      {/* 왼쪽: 설정 */}
      <div className="grid gap-8 content-start">
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
                      {s.kind}
                    </span>
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="m-0 p-0 border-0 min-w-0 grid gap-4">
          <legend className="meta mb-2">문턱값 (바꾸면 바로 다시 계산)</legend>
          <Range id="grace" label="여유 시간" value={graceMin} min={30} max={180} step={15} unit="분" onChange={setGraceMin} hint="평소 기상 시각·평소 가장 긴 정지 시간보다 이만큼 더 지나야 알린다" />
          <Range id="still" label="무활동 분" value={stillMin} min={15} max={90} step={5} unit="분" onChange={setStillMin} hint="정지 + 호흡 미검출이 이만큼 이어지면 알린다" />
          <Range id="fall" label="쓰러짐 후 기다림" value={fallMin} min={3} max={30} step={1} unit="분" onChange={setFallMin} hint="쓰러짐 표시 뒤 움직임 없이 이만큼 지나면 알린다" />
          <Check
            id="breath"
            label="호흡이 보이면 2시간 더 기다림"
            hint="자는 중·쉬는 중이면 기상 지연·장시간 정지 알림을 미룬다"
            checked={useBreathing}
            onChange={setUseBreathing}
          />
        </fieldset>

        <fieldset className="m-0 p-0 border-0 min-w-0 grid gap-3">
          <legend className="meta mb-2">설치·시뮬레이터</legend>
          <Check id="fallsensor" label="천장 낙상 센서 달기" hint="침대 위 호흡 센서 + 천장 센서 2대. 끄면 침대 센서 1대" checked={fallSensor} onChange={setFallSensor} />
          <label className="grid gap-1">
            <span className="text-[14px]" style={{ color: 'var(--ink-2)' }}>
              레이더 잡음
            </span>
            <select value={noise} onChange={(e) => setNoise(e.target.value as Noise)}>
              {NOISES.map((n) => (
                <option key={n.id} value={n.id}>
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
          <div className="flex items-center gap-2">
            <span className="meta">시드 {seed}</span>
            <button type="button" className="btn btn-ghost" onClick={() => setSeed((s) => (s * 48271) % 2147483647 || 7)}>
              다른 사람·다른 날들로
            </button>
          </div>
        </fieldset>

        <div className="grid gap-1 text-[13.5px] leading-[1.6]" style={{ color: 'var(--ink-2)' }}>
          <p className="meta">이 사람의 기준선 (처음 {baseline.days}일)</p>
          <p>
            평일 기상 {baseline.wake.weekday === null ? '—' : hm(baseline.wake.weekday)} · 주말 기상 {baseline.wake.weekend === null ? '—' : hm(baseline.wake.weekend)}
          </p>
          <p>
            평일 취침 {baseline.bed.weekday === null ? '—' : hm(baseline.bed.weekday)} · 주말 취침 {baseline.bed.weekend === null ? '—' : hm(baseline.bed.weekend)}
          </p>
          <p>
            집에서 움직이는 비율 {Math.round(baseline.activeShare.mean * 100)}% · 깨어서 가장 길게 가만히 있던 시간 {baseline.maxStill}분
          </p>
        </div>
      </div>

      {/* 오른쪽: 결과 */}
      <div className="grid gap-12 content-start min-w-0">
        <section aria-labelledby="rhythm-title" className="grid gap-3 min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <h2 id="rhythm-title" className={H2} style={H2_STYLE}>
              생활 리듬
            </h2>
            <DayPicker day={day} onChange={setPickedDay} />
          </div>
          <StateLegend withTruth={sim.emergencyT !== null} />
          <div className="hidden sm:block">
            <RhythmStrip
              id="rhythm-wide"
              states={states}
              days={DAYS}
              baselineDays={baselineDays}
              incidents={incidents}
              notices={notices}
              emergencyT={sim.emergencyT}
              expectedWakes={expectedWakes}
              selectedDay={day}
              onSelectDay={setPickedDay}
            />
          </div>
          <div className="sm:hidden">
            <RhythmStrip
              id="rhythm-tall"
              states={states}
              days={DAYS}
              baselineDays={baselineDays}
              incidents={incidents}
              notices={notices}
              emergencyT={sim.emergencyT}
              expectedWakes={expectedWakes}
              selectedDay={day}
              onSelectDay={setPickedDay}
              w={360}
            />
          </div>
          <p className="text-[13.5px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
            한 줄이 하루입니다(15분 칸). 검은 눈금은 기준선이 정한 그날의 평소 기상 시각, 오른쪽 끝 붉은 칸은 활동 감소 요약이 나간 날. 줄을 누르거나 위에서
            날짜를 고르면 아래에 그날을 1분 단위로 펼칩니다.
          </p>
        </section>

        <section aria-labelledby="day-title" className="grid gap-3 min-w-0">
          <h2 id="day-title" className={H2} style={H2_STYLE}>
            {dayLabel(day)} 확대
          </h2>
          <div className="hidden sm:block">
            <DayTimeline
              id="day-wide"
              day={day}
              minutes={sim.minutes}
              states={states}
              incidents={incidents}
              expectedWake={day >= baselineDays ? expectedWakes[day] : null}
              graceMin={graceMin}
              emergencyT={sim.emergencyT}
            />
          </div>
          <div className="sm:hidden">
            <p className="meta mb-1">위부터 상태 · 움직임 세기 · 호흡 잡힘 · 쓰러짐 표시</p>
            <DayTimeline
              id="day-tall"
              day={day}
              minutes={sim.minutes}
              states={states}
              incidents={incidents}
              expectedWake={day >= baselineDays ? expectedWakes[day] : null}
              graceMin={graceMin}
              emergencyT={sim.emergencyT}
              w={360}
            />
          </div>
          <p className="text-[13.5px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
            움직임 세기의 점선이 &ldquo;움직임&rdquo; 문턱(15)입니다. 그 아래로 가만히 있을 때 최근 10분 안에 호흡이 잡혔으면 &ldquo;정지 + 호흡&rdquo;, 아니면 &ldquo;정지 + 호흡
            미검출&rdquo;. 키트는 원신호가 아니라 이 결과값을 1분마다 준다고 가정했습니다.
          </p>
          {dayIncidents.length === 0 && <p className="meta">이날은 알림이 없습니다.</p>}
        </section>

        <section aria-labelledby="alerts-title" className="grid gap-3 min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="alerts-title" className={H2} style={H2_STYLE}>
              알림과 단계
            </h2>
            <span className="meta">
              알림 {incidents.length} · 요약 {notices.length}
            </span>
          </div>
          {incidents.length === 0 && notices.length === 0 ? (
            <p className="text-[15px]" style={{ color: 'var(--muted)' }}>
              알림이 없습니다. 평소 리듬 안에서 지냈다는 뜻입니다.
            </p>
          ) : (
            <ul className="list-none m-0 p-0 grid gap-4">
              {incidents.slice(0, 12).map((i) => {
                const truth = sim.truth[i.t];
                const isFalse = sim.emergencyT === null || i.t < sim.emergencyT;
                const iDay = Math.floor(i.t / DAY_MIN);
                return (
                  <li key={i.id} className="pl-4 py-1 grid gap-1" style={{ borderLeft: isFalse ? '1px solid var(--rule)' : '3px solid var(--accent)' }}>
                    <p className="meta" style={{ color: isFalse ? 'var(--muted)' : 'var(--accent)' }}>
                      {i.id} · {RULE_LABEL[i.rule]} · {when(i.t)}
                    </p>
                    <p className="text-[16px] font-semibold leading-[1.45]" style={{ color: 'var(--ink)' }}>
                      {i.title}
                    </p>
                    <p className="text-[14.5px] leading-[1.6]" style={{ color: 'var(--ink-2)' }}>
                      {i.detail}
                    </p>
                    <p className="text-[14px] leading-[1.6]" style={{ color: 'var(--ink)' }}>
                      {i.stages.map((s) => `${hm(s.t % DAY_MIN)} ${STAGE_LABEL[s.stage]}`).join(' → ')}
                      {' — '}
                      {i.outcome === 'ok'
                        ? `${i.endT - i.t}분 뒤 본인이 "괜찮아요"`
                        : i.outcome === 'motion'
                          ? `${i.endT - i.t}분 뒤 움직임이 보여 자동으로 멈춤`
                          : '연락처까지 갔습니다'}
                    </p>
                    <p className="meta">
                      시뮬레이터 정답: {TRUTH_LABEL[truth]} → {isFalse ? '헛경보' : '맞은 알림'}
                      {iDay !== day && (
                        <>
                          {' · '}
                          <button type="button" className="link-u" onClick={() => setPickedDay(iDay)} style={{ color: 'var(--ink-2)' }}>
                            그날 보기
                          </button>
                        </>
                      )}
                    </p>
                  </li>
                );
              })}
              {incidents.length > 12 && <li className="meta">나머지 {incidents.length - 12}개는 생략했습니다.</li>}
              {notices.map((n) => (
                <li key={`n${n.day}`} className="pl-4 py-1 grid gap-1" style={{ borderLeft: '1px dashed var(--ink-2)' }}>
                  <p className="meta">주간 요약 · {n.day + 1}일째 밤</p>
                  <p className="text-[16px] font-semibold leading-[1.45]" style={{ color: 'var(--ink)' }}>
                    {n.title}
                  </p>
                  <p className="text-[14.5px] leading-[1.6]" style={{ color: 'var(--ink-2)' }}>
                    {n.detail}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="eval-title" className="grid gap-3 min-w-0">
          <h2 id="eval-title" className={H2} style={H2_STYLE}>
            이 시뮬레이션의 정답과 비교
          </h2>
          <dl className="m-0 grid gap-x-6 gap-y-3 grid-cols-2 sm:grid-cols-3">
            <Stat label="헛경보(본인 확인)" value={`${ev.falseAlerts}번`} sub={`${f1(ev.monitoredWeeks)}주 동안 · 주당 ${ev.monitoredWeeks ? f1(ev.falseAlerts / ev.monitoredWeeks) : '—'}`} />
            <Stat label="헛경보 중 관리자까지" value={`${ev.falseManager}번`} sub={`연락처까지 ${ev.falseContact}번`} />
            {sim.emergencyT !== null ? (
              <>
                <Stat label="쓰러짐 → 첫 알림" value={ev.missed ? '놓침' : mins(ev.delayMin)} sub={`쓰러진 시각 ${when(sim.emergencyT)}`} />
                <Stat label="쓰러짐 → 관리자" value={mins(ev.managerDelayMin)} sub={`본인 확인 ${LADDER.selfWaitMin}분 뒤`} />
              </>
            ) : sim.slowOnsetDay !== null ? (
              <Stat label="활동 감소 → 요약" value={ev.noticeDelayDays === null ? '아직' : `${ev.noticeDelayDays}일`} sub={`${sim.slowOnsetDay + 1}일째부터 줄어듦`} />
            ) : (
              <Stat label="응급 상황" value="없음" sub="모든 알림이 헛경보" />
            )}
          </dl>
          <p className="text-[13.5px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
            알고리즘은 레이더 값만 봅니다. 시뮬레이터는 실제로 자는 중인지·쓰러졌는지 알고 있어서 여기서 미리 맞춰 볼 수 있습니다. 시뮬레이션 속 본인은 깨어
            있으면 대개 몇 분 안에, 자는 중이면 절반쯤 &ldquo;괜찮아요&rdquo;를 누르고, 쓰러졌으면 누르지 못한다고 가정했습니다.
          </p>
        </section>

        <section aria-labelledby="meter-title" className="grid gap-4 min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="meter-title" className={H2} style={H2_STYLE}>
              헛경보 미터
            </h2>
            <span className="meta" aria-live="polite">
              {meterStale ? '계산 중…' : `시드 ${meter?.cell.runs ?? 0}개 × ${DAYS}일 × 시나리오 5개`}
            </span>
          </div>
          <p className="text-[14px] leading-[1.6]" style={{ color: 'var(--ink-2)' }}>
            지금 문턱값으로 다른 사람·다른 날들({meter?.cell.runs ?? 6}명분)을 전부 다시 돌려 잽니다. 헛경보를 줄이면 쓰러짐을 늦게 알고, 빨리 알면 헛경보가 늘어납니다.
            표의 숫자는 매번 계산한 시뮬레이션 값입니다.
          </p>
          {meter ? (
            <div className="grid gap-5" style={{ opacity: meterStale ? 0.55 : 1 }}>
              <dl className="m-0 grid gap-x-6 gap-y-3 grid-cols-2 sm:grid-cols-4">
                <Stat label="정상 생활 헛경보" value={`${f1(meter.cell.falsePerWeek.normal)}/주`} sub="본인 확인 단계" />
                <Stat label="늦잠 있는 주" value={`${f1(meter.cell.falsePerWeek.oversleep)}/주`} sub={`장기 외출 ${f1(meter.cell.falsePerWeek.longAway)}/주`} />
                <Stat label="관리자까지 간 헛경보" value={`${meter.cell.managerPerWeek.toFixed(2)}/주`} sub="세 시나리오 합쳐서" />
                <Stat
                  label="쓰러짐 → 첫 알림"
                  value={mins(meter.cell.fallDelay.sensor)}
                  sub={`천장 센서 없으면 ${mins(meter.cell.fallDelay.noSensor)}${meter.cell.fallMissed.noSensor > 0 ? ` · 놓침 ${Math.round(meter.cell.fallMissed.noSensor * 100)}%` : ''}`}
                />
              </dl>

              <fieldset className="m-0 p-0 border-0 min-w-0">
                <legend className="meta mb-2">하나만 바꿔 보기</legend>
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="바꿔 볼 문턱값">
                  {(Object.keys(SWEEP_VALUES) as SweepParam[]).map((p) => (
                    <label key={p} className="relative">
                      <input type="radio" name="sweep" value={p} checked={sweepParam === p} onChange={() => setSweepParam(p)} className="peer sr-only" />
                      <span
                        className="inline-flex items-center min-h-[40px] px-3 rounded-[var(--r-md)] text-[14px] font-semibold cursor-pointer peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
                        style={{
                          border: `1px solid ${sweepParam === p ? 'var(--accent)' : 'var(--rule)'}`,
                          background: sweepParam === p ? 'var(--accent-soft)' : 'var(--surface)',
                          color: sweepParam === p ? 'var(--accent)' : 'var(--ink)',
                          outlineColor: 'var(--accent)',
                        }}
                      >
                        {SWEEP_LABEL[p].label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="문턱값별 헛경보와 검출 지연 표">
                <table className="w-full border-collapse text-[14px] leading-[1.5] min-w-[560px]">
                  <caption className="sr-only">{SWEEP_LABEL[sweepParam].label}을 바꿨을 때 헛경보와 검출 지연(시뮬레이션)</caption>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--ink-2)' }}>
                      {[SWEEP_LABEL[sweepParam].label, '정상 헛경보/주', '늦잠 주 헛경보/주', '관리자까지/주', '쓰러짐→알림', '센서 없이', '활동 감소→요약'].map((h) => (
                        <th key={h} scope="col" className="text-left font-normal py-1.5 pr-3 meta">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {meter.rows.map((r) => {
                      const now = th[sweepParam] === r.value;
                      return (
                        <tr key={r.value} style={{ borderBottom: '1px solid var(--rule)', background: now ? 'var(--accent-soft)' : undefined }}>
                          <th scope="row" className="text-left font-semibold py-1.5 pr-3" style={{ color: now ? 'var(--accent)' : 'var(--ink)' }}>
                            {r.value}
                            {SWEEP_LABEL[sweepParam].unit}
                            {now && <span className="meta ml-1">지금</span>}
                          </th>
                          <Td>{f1(r.cell.falsePerWeek.normal)}</Td>
                          <Td>{f1(r.cell.falsePerWeek.oversleep)}</Td>
                          <Td>{r.cell.managerPerWeek.toFixed(2)}</Td>
                          <Td>{mins(r.cell.fallDelay.sensor)}</Td>
                          <Td>{mins(r.cell.fallDelay.noSensor)}</Td>
                          <Td>{r.cell.declineDays === null ? '—' : `${r.cell.declineDays}일`}</Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[13.5px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
                다른 문턱값은 왼쪽 설정 그대로 두고 {SWEEP_LABEL[sweepParam].label}만 바꿉니다. 지연은 중앙값, 헛경보는 기준선 뒤 응급 상황 전까지의 주 수로 나눈 값입니다.
                실제 집에서의 헛경보율은 아직 아무도 공개하지 않아서, 이 표를 실거주 시험으로 다시 채우는 것이 졸업작품의 목표입니다.
              </p>
            </div>
          ) : (
            <p className="meta">계산 중…</p>
          )}
        </section>

        <section aria-labelledby="ladder-title" className="grid gap-3 min-w-0">
          <h2 id="ladder-title" className={H2} style={H2_STYLE}>
            직접 해 보기: 알림을 받은 본인
          </h2>
          <p className="text-[14px] leading-[1.6]" style={{ color: 'var(--ink-2)' }}>
            본인 확인 {LADDER.selfWaitMin}분 → 관리자 {LADDER.managerWaitMin}분 → 비상 연락처. &ldquo;괜찮아요&rdquo;를 누르면 그 자리에서 멈춥니다.
          </p>
          <LadderPractice ladder={LADDER} />
        </section>

        <p className="text-[13px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
          상태 이름: {(['away', 'active', 'resting', 'stillNoBreath', 'fallen'] as const).map((s) => STATE_LABEL[s]).join(' · ')}. 이 데모는 사망을 감지하지 않습니다.
          &ldquo;평소 생활 리듬에서 벗어남&rdquo;과 &ldquo;쓰러진 뒤 움직임 없음&rdquo;만 봅니다.
        </p>
      </div>
    </div>
  );
}

function DayPicker({ day, onChange }: { day: number; onChange: (d: number) => void }): JSX.Element {
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" className="btn btn-ghost px-3" onClick={() => onChange(Math.max(0, day - 1))} disabled={day === 0} aria-label="전날">
        <span aria-hidden="true">←</span>
      </button>
      <label className="flex items-center gap-2">
        <span className="sr-only">날짜</span>
        <select value={day} onChange={(e) => onChange(Number(e.target.value))}>
          {Array.from({ length: DAYS }, (_, d) => (
            <option key={d} value={d}>
              {dayLabel(d)}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="btn btn-ghost px-3" onClick={() => onChange(Math.min(DAYS - 1, day + 1))} disabled={day === DAYS - 1} aria-label="다음 날">
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

function Td({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <td className="py-1.5 pr-3" style={{ color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}>
      {children}
    </td>
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

function Range({
  id,
  label,
  value,
  min,
  max,
  step,
  unit,
  hint,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  hint: string;
  onChange: (v: number) => void;
}): JSX.Element {
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="flex items-baseline justify-between gap-2">
        <span className="text-[15px] font-semibold" style={{ color: 'var(--ink)' }}>
          {label}
        </span>
        <span className="meta" style={{ color: 'var(--ink)' }}>
          {value}
          {unit}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-describedby={`${id}-hint`}
        aria-valuetext={`${value}${unit}`}
        className="w-full min-h-0 p-0"
        style={{ accentColor: 'var(--accent)' }}
      />
      <p id={`${id}-hint`} className="text-[13px] leading-[1.5]" style={{ color: 'var(--muted)' }}>
        {hint}
      </p>
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
