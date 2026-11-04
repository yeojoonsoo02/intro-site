import { METRICS, metricValue, when, type CusumTrace } from './analyze';
import { DailyChart } from './charts';
import type { Alert, Baseline, CatConfig, DailyRow, MetricId } from './types';

// 병원에 가져갈 1쪽 리포트. 인쇄하면 이 부분만 나온다(globals.css의 .cat-report 인쇄 규칙).
// 진단이 아니라 "화장실 행동 기록의 변화"만 적는다.

interface Props {
  cat: CatConfig;
  rows: DailyRow[];
  baseline: Baseline | null;
  baselineDays: number;
  traces: Record<MetricId, CusumTrace> | undefined;
  alerts: Alert[];
  ambiguousShare: number;
}

const fmt = (v: number | null | undefined, digits: number): string => (v === null || v === undefined ? '—' : v.toFixed(digits));

export default function Report({ cat, rows, baseline, baselineDays, traces, alerts, ambiguousShare }: Props): JSX.Element {
  const days = rows.length;
  const last7 = (id: MetricId): number | null => {
    const xs = rows.slice(-7).map((r) => metricValue(r, id)).filter((x): x is number => x !== null);
    return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
  };
  const mine = alerts.filter((a) => a.catId === cat.id).sort((a, b) => a.t - b.t);
  const stays = rows.slice(-7).map((r) => r.stayS).filter((x): x is number => x !== null);

  return (
    <article className="cat-report grid gap-5 p-5 sm:p-7 rounded-[var(--r-lg)]" style={{ background: 'var(--surface)', border: '1px solid var(--rule)' }} aria-labelledby="report-title">
      <header className="grid gap-1" style={{ borderBottom: '1px solid var(--ink-2)', paddingBottom: '0.75rem' }}>
        <p className="meta">화장실 행동 기록 · 시뮬레이션 데이터</p>
        <h3 id="report-title" className="text-[22px] font-semibold" style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)' }}>
          {cat.name} ({cat.male ? '수컷' : '암컷'}, 등록 체중 {(cat.weightG / 1000).toFixed(1)}kg)
        </h3>
        <p className="text-[14px]" style={{ color: 'var(--ink-2)' }}>
          기록 {days}일 · 평소 기준선은 처음 {baselineDays}일 · 최근 7일과 비교 · 이 집 화장실 하나의 무게 센서 기록
        </p>
      </header>

      <table className="w-full border-collapse text-[14.5px] leading-[1.5]">
        <caption className="sr-only">평소와 최근 7일 비교</caption>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--rule)' }}>
            {['지표', '평소(기준선)', '최근 7일', '변화'].map((h) => (
              <th key={h} scope="col" className="text-left font-normal py-1.5 pr-2 meta">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {METRICS.map((m) => {
            const base = baseline?.mean[m.id];
            const now = last7(m.id);
            const ch = base && now !== null ? (now - base) / base : null;
            const flagged = ch !== null && m.dir * ch >= m.minEffect;
            return (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--rule)' }}>
                <th scope="row" className="text-left font-semibold py-1.5 pr-2" style={{ color: 'var(--ink)' }}>
                  {m.label} <span className="meta">{m.unit}</span>
                </th>
                <td className="py-1.5 pr-2" style={{ color: 'var(--ink-2)' }}>
                  {fmt(base, m.digits)}
                </td>
                <td className="py-1.5 pr-2" style={{ color: 'var(--ink)' }}>
                  {fmt(now, m.digits)}
                </td>
                <td className="py-1.5" style={{ color: flagged ? 'var(--accent)' : 'var(--ink-2)', fontWeight: flagged ? 600 : 400 }}>
                  {ch === null ? '—' : `${ch > 0 ? '+' : ''}${Math.round(ch * 100)}%`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-[13.5px] -mt-2" style={{ color: 'var(--muted)' }}>
        최근 7일 평균 머문 시간 {stays.length ? `${Math.round(stays.reduce((a, b) => a + b, 0) / stays.length)}초` : '—'} · 어느 고양이인지 구분이 어려웠던 방문{' '}
        {Math.round(ambiguousShare * 100)}%(확률만큼 나눠 셈)
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {(['weight', 'urinations'] as const).map((id) => {
          const m = METRICS.find((x) => x.id === id);
          if (!m) return null;
          return (
            <DailyChart
              key={id}
              id={`report-${id}`}
              label={m.label}
              unit={m.unit}
              digits={m.digits}
              rows={rows}
              metric={id}
              baseline={baseline}
              baselineDays={baselineDays}
              mean7={traces?.[id].mean7}
              alertDays={mine.filter((a) => a.metric === id || (id === 'urinations' && a.metric === 'urineG')).map((a) => Math.floor(a.t / 86400))}
              height={130}
              span={Math.max(days, 28)}
            />
          );
        })}
      </div>

      <section aria-labelledby="report-alerts" className="grid gap-2">
        <h4 id="report-alerts" className="text-[15px] font-semibold" style={{ color: 'var(--ink)' }}>
          알림 기록
        </h4>
        {mine.length === 0 ? (
          <p className="text-[14px]" style={{ color: 'var(--muted)' }}>
            이 기간에 알림이 없었습니다.
          </p>
        ) : (
          <ul className="m-0 p-0 list-none grid gap-1.5">
            {mine.map((a) => (
              <li key={a.id} className="text-[14px] leading-[1.55]" style={{ color: 'var(--ink)' }}>
                <span className="meta mr-2">{when(a.t)}</span>
                <b>{a.kind === 'urgent' ? '급한 변화' : '느린 변화'}</b> · {a.title}
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="text-[13px] leading-[1.6] pt-3" style={{ borderTop: '1px solid var(--rule)', color: 'var(--ink-2)' }}>
        <b>진단이 아닙니다.</b> 화장실에 놓은 무게 센서가 잰 방문 횟수·머문 시간·모래 무게 변화가 이 고양이의 평소와 얼마나 달라졌는지만
        보여 줍니다. 물을 마신 양, 다른 곳에 본 소변, 약·사료 변화는 반영되지 않습니다. 판단은 수의사가 합니다. 이 리포트는 웹 데모의 시뮬레이션
        데이터로 만들었습니다.
      </footer>
    </article>
  );
}
