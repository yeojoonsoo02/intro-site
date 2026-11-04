import { DAY_S, type Baseline, type DailyRow, type Identified, type MetricId, type Sample } from './types';
import { metricValue } from './analyze';

// 가벼운 SVG 차트. 색은 사이트 토큰만 쓴다(라이트·다크 자동).
// 'use client'를 두지 않는다: CatDemo(클라이언트)에서만 import된다.

/** 하루 기록 차트의 기본 폭. 데스크톱 두 칸·폰 한 칸 모두 실제 폭이 300~360px라 글자가 11~12px로 보인다. */
const DAILY_W = 360;

function ticks(lo: number, hi: number, n = 3): number[] {
  if (hi <= lo) return [lo];
  const step = (hi - lo) / (n - 1);
  return Array.from({ length: n }, (_, i) => lo + i * step);
}

export interface DailyChartProps {
  id: string;
  label: string;
  unit: string;
  digits: number;
  rows: DailyRow[];
  metric: MetricId;
  baseline: Baseline | null;
  baselineDays: number;
  mean7: (number | null)[] | undefined;
  alertDays: number[];
  height?: number;
  /** x축 최소 길이(일) */
  span: number;
}

/** 날마다 값(점) · 최근 7일 평균(선) · 기준선 평균 ±2표준편차(띠) · 알림(세로선) */
export function DailyChart({ id, label, unit, digits, rows, metric, baseline, baselineDays, mean7, alertDays, height = 170, span }: DailyChartProps): JSX.Element {
  const W = DAILY_W;
  const H = height;
  const pad = { l: 40, r: 8, t: 12, b: 24 };
  const n = Math.max(span, rows.length, 1);
  const vals = rows.map((r) => metricValue(r, metric));
  const nums = vals.filter((v): v is number => v !== null);
  const bandLo = baseline ? baseline.mean[metric] - 2 * baseline.sd[metric] : Infinity;
  const bandHi = baseline ? baseline.mean[metric] + 2 * baseline.sd[metric] : -Infinity;
  let lo = Math.min(...nums, bandLo);
  let hi = Math.max(...nums, bandHi);
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
    lo = 0;
    hi = 1;
  }
  // 횟수·양은 0 아래가 없다(평소 범위 띠가 0 아래로 내려가도 자른다)
  if (metric !== 'weight') lo = 0;
  if (hi - lo < 1e-6) hi = lo + 1;
  const padY = (hi - lo) * 0.08;
  lo -= metric === 'weight' ? padY : 0;
  hi += padY;
  const x = (d: number): number => pad.l + ((d + 0.5) / n) * (W - pad.l - pad.r);
  const y = (v: number): number => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);
  const line = (mean7 ?? [])
    .map((v, d) => (v === null ? null : `${x(d).toFixed(1)},${y(v).toFixed(1)}`))
    .filter(Boolean)
    .join(' ');
  const last = [...vals].reverse().find((v) => v !== null);
  const lastMean = [...(mean7 ?? [])].reverse().find((v) => v !== null);
  const desc =
    rows.length === 0
      ? `${label}: 아직 기록이 없습니다.`
      : `${label}: ${rows.length}일 기록. 마지막 날 ${last !== undefined && last !== null ? last.toFixed(digits) : '없음'}${unit}` +
        (baseline ? `, 기준선 평균 ${baseline.mean[metric].toFixed(digits)}${unit}` : ', 기준선 만드는 중') +
        (lastMean !== undefined && lastMean !== null ? `, 최근 7일 평균 ${lastMean.toFixed(digits)}${unit}` : '') +
        (alertDays.length ? `, 알림 ${alertDays.length}번` : '') +
        '.';
  const step = n > 63 ? 21 : n > 35 ? 14 : 7;
  const weekTicks = Array.from({ length: Math.floor((n - 1) / step) + 1 }, (_, i) => i * step);

  return (
    <figure className="m-0 min-w-0">
      <figcaption className="flex items-baseline justify-between gap-3 mb-1">
        <span className="text-[15px] font-semibold" style={{ color: 'var(--ink)' }}>
          {label}
        </span>
        <span className="meta">{unit}</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-labelledby={`${id}-d`} style={{ fontFamily: 'var(--font-sans)', display: 'block' }}>
        <title id={`${id}-d`}>{desc}</title>
        {/* 기준선을 만드는 기간 */}
        <rect x={pad.l} y={pad.t} width={Math.max(0, x(Math.min(baselineDays, n) - 0.5) - pad.l)} height={H - pad.t - pad.b} style={{ fill: 'var(--surface-2)' }} />
        {baseline && (
          <g>
            <rect
              x={x(baselineDays - 0.5)}
              y={y(bandHi)}
              width={Math.max(0, W - pad.r - x(baselineDays - 0.5))}
              height={Math.max(0, y(Math.max(bandLo, lo)) - y(bandHi))}
              style={{ fill: 'var(--accent-soft)' }}
              opacity={0.7}
            />
            <line x1={pad.l} x2={W - pad.r} y1={y(baseline.mean[metric])} y2={y(baseline.mean[metric])} style={{ stroke: 'var(--muted)' }} strokeDasharray="4 4" strokeWidth={1} />
          </g>
        )}
        {ticks(lo, hi).map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} style={{ stroke: 'var(--rule)' }} strokeWidth={0.6} />
            <text x={pad.l - 6} y={y(v) + 4} textAnchor="end" fontSize={11} style={{ fill: 'var(--muted)' }}>
              {v.toFixed(metric === 'weight' ? 2 : metric === 'urineG' ? 0 : 1)}
            </text>
          </g>
        ))}
        {weekTicks.map((d) => (
          <text key={d} x={x(d)} y={H - 6} textAnchor="middle" fontSize={11} style={{ fill: 'var(--muted)' }}>
            {d + 1}일
          </text>
        ))}
        {alertDays.map((d) => (
          <line key={d} x1={x(d)} x2={x(d)} y1={pad.t} y2={H - pad.b} style={{ stroke: 'var(--accent)' }} strokeWidth={1.6} />
        ))}
        {vals.map((v, d) =>
          v === null ? null : <circle key={d} cx={x(d)} cy={y(v)} r={2.4} style={{ fill: 'var(--ink-2)' }} opacity={0.55} />,
        )}
        {line && <polyline points={line} fill="none" style={{ stroke: 'var(--ink)' }} strokeWidth={2} strokeLinejoin="round" />}
      </svg>
    </figure>
  );
}

export function ChartLegend(): JSX.Element {
  const item = 'inline-flex items-center gap-1.5';
  return (
    <p className="meta flex flex-wrap gap-x-4 gap-y-1" aria-hidden="true">
      <span className={item}>
        <svg width="10" height="10"><circle cx="5" cy="5" r="2.6" style={{ fill: 'var(--ink-2)' }} opacity={0.6} /></svg>하루 값
      </span>
      <span className={item}>
        <svg width="18" height="10"><line x1="0" x2="18" y1="5" y2="5" style={{ stroke: 'var(--ink)' }} strokeWidth="2" /></svg>최근 7일 평균
      </span>
      <span className={item}>
        <svg width="14" height="10"><rect width="14" height="10" style={{ fill: 'var(--accent-soft)' }} /></svg>평소 범위(기준선 ±2SD)
      </span>
      <span className={item}>
        <svg width="14" height="10"><rect width="14" height="10" style={{ fill: 'var(--surface-2)' }} /></svg>기준선 만드는 기간
      </span>
      <span className={item}>
        <svg width="6" height="12"><line x1="3" x2="3" y1="0" y2="12" style={{ stroke: 'var(--accent)' }} strokeWidth="2" /></svg>알림
      </span>
    </p>
  );
}

export const hm = (t: number): string => {
  const s = ((t % DAY_S) + DAY_S) % DAY_S;
  return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}`;
};

/** 하루치 센서 원신호(0~24시)와 찾은 방문 */
export function SignalChart({ day, samples, visits, selected, w = 640 }: { day: number; samples: Sample[]; visits: Identified[]; selected: number | null; w?: number }): JSX.Element {
  const W = w;
  const H = w < 500 ? 190 : 170;
  const pad = { l: 46, r: 10, t: 14, b: 24 };
  const t0 = day * DAY_S;
  const ws = samples.map((s) => s.w);
  const lo = Math.min(...ws) - 200;
  const hi = Math.max(...ws) + 200;
  const x = (t: number): number => pad.l + ((t - t0) / DAY_S) * (W - pad.l - pad.r);
  const y = (w: number): number => pad.t + (1 - (w - lo) / (hi - lo || 1)) * (H - pad.t - pad.b);
  // 1초 값이 수천 개라 x 픽셀 하나에 최솟값·최댓값만 남겨 그린다
  const pts: string[] = [];
  let bucket = -1;
  let mn = 0;
  let mx = 0;
  const flush = (): void => {
    if (bucket < 0) return;
    pts.push(`${bucket},${y(mn).toFixed(1)}`, `${bucket},${y(mx).toFixed(1)}`);
  };
  for (const s of samples) {
    const b = Math.round(x(s.t));
    if (b !== bucket) {
      flush();
      bucket = b;
      mn = s.w;
      mx = s.w;
    } else {
      mn = Math.min(mn, s.w);
      mx = Math.max(mx, s.w);
    }
  }
  flush();
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-labelledby={`sig-${day}-${w}`} style={{ fontFamily: 'var(--font-sans)', display: 'block' }}>
      <title id={`sig-${day}-${w}`}>
        {`${day + 1}일째 저울 원신호. 값 ${samples.length}개, 찾은 방문 ${visits.length}번. 모래 무게 위로 고양이 체중만큼 튀어 오른 곳이 방문이다.`}
      </title>
      {ticks(lo + 200, hi - 200).map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} style={{ stroke: 'var(--rule)' }} strokeWidth={0.6} />
          <text x={pad.l - 6} y={y(v) + 4} textAnchor="end" fontSize={11} style={{ fill: 'var(--muted)' }}>
            {(v / 1000).toFixed(1)}kg
          </text>
        </g>
      ))}
      {[0, 6, 12, 18, 24].map((h) => (
        <text key={h} x={x(t0 + h * 3600)} y={H - 6} textAnchor="middle" fontSize={11} style={{ fill: 'var(--muted)' }}>
          {h}시
        </text>
      ))}
      {visits.map((v) => (
        <rect
          key={v.id}
          x={x(v.start) - 2}
          y={pad.t}
          width={Math.max(4, x(v.end) - x(v.start) + 4)}
          height={H - pad.t - pad.b}
          style={{ fill: v.id === selected ? 'var(--accent-soft)' : 'transparent', stroke: v.id === selected ? 'var(--accent)' : 'none' }}
          strokeWidth={1}
        />
      ))}
      <polyline points={pts.join(' ')} fill="none" style={{ stroke: 'var(--ink-2)' }} strokeWidth={1} />
    </svg>
  );
}

/** 방문 하나를 확대: 들어옴·나감·가만히 있던 구간·전후 모래 무게 */
export function VisitChart({ visit, samples, w = 640 }: { visit: Identified; samples: Sample[]; w?: number }): JSX.Element {
  const W = w;
  const H = w < 500 ? 230 : 190;
  const pad = { l: 50, r: 12, t: 16, b: 26 };
  const from = visit.start - 25;
  const to = visit.end + 25;
  const seg = samples.filter((s) => s.t >= from && s.t <= to);
  const lo = visit.preG - 150;
  const hi = Math.max(...seg.map((s) => s.w)) + 150;
  const x = (t: number): number => pad.l + ((t - from) / (to - from)) * (W - pad.l - pad.r);
  const y = (w: number): number => pad.t + (1 - (w - lo) / (hi - lo || 1)) * (H - pad.t - pad.b);
  const pts = seg.map((s) => `${x(s.t).toFixed(1)},${y(s.w).toFixed(1)}`).join(' ');
  const lbl = (t: number, text: string, anchor: 'start' | 'end'): JSX.Element => (
    <text x={x(t) + (anchor === 'start' ? 4 : -4)} y={pad.t + 10} textAnchor={anchor} fontSize={11.5} style={{ fill: 'var(--accent)' }}>
      {text}
    </text>
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-labelledby={`visit-${visit.id}-${w}`} style={{ fontFamily: 'var(--font-sans)', display: 'block' }}>
      <title id={`visit-${visit.id}-${w}`}>
        {`방문 확대: ${hm(visit.start)}에 들어와 ${visit.stayS}초 머묾. 추정 체중 ${(visit.catWeightG / 1000).toFixed(2)}kg, 가장 오래 가만히 있던 구간 ${visit.stillS}초, 모래 무게 변화 ${visit.deltaG.toFixed(1)}g.`}
      </title>
      <line x1={pad.l} x2={x(visit.start)} y1={y(visit.preG)} y2={y(visit.preG)} style={{ stroke: 'var(--muted)' }} strokeDasharray="4 3" />
      <line x1={x(visit.end)} x2={W - pad.r} y1={y(visit.postG)} y2={y(visit.postG)} style={{ stroke: 'var(--accent)' }} strokeDasharray="4 3" />
      <line x1={x(visit.start)} x2={x(visit.start)} y1={pad.t} y2={H - pad.b} style={{ stroke: 'var(--accent)' }} />
      <line x1={x(visit.end)} x2={x(visit.end)} y1={pad.t} y2={H - pad.b} style={{ stroke: 'var(--accent)' }} />
      {lbl(visit.start, '들어옴', 'start')}
      {lbl(visit.end, '나감', 'end')}
      <polyline points={pts} fill="none" style={{ stroke: 'var(--ink)' }} strokeWidth={1.3} strokeLinejoin="round" />
      <text x={pad.l} y={H - 8} fontSize={11} style={{ fill: 'var(--muted)' }}>
        {`전 ${(visit.preG / 1000).toFixed(3)}kg → 후 ${(visit.postG / 1000).toFixed(3)}kg (${visit.deltaG >= 0 ? '+' : ''}${visit.deltaG.toFixed(1)}g)`}
      </text>
      <text x={W - pad.r} y={H - 8} textAnchor="end" fontSize={11} style={{ fill: 'var(--muted)' }}>
        {`${visit.stayS}초`}
      </text>
    </svg>
  );
}

