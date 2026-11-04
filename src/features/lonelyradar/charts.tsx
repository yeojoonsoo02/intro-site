import { STATE_LABEL } from './detect';
import { hm } from './alerts';
import { DAY_MIN, type Incident, type Notice, type RadarMinute, type State } from './types';

// 가벼운 SVG 차트. 색은 사이트 토큰만 쓴다(라이트·다크 자동).
// 'use client'를 두지 않는다: RadarDemo(클라이언트)에서만 import된다.

const FILL: Record<State, { fill: string; opacity: number } | null> = {
  away: null,
  active: { fill: 'var(--ink-2)', opacity: 0.85 },
  resting: { fill: 'var(--muted)', opacity: 0.3 },
  stillNoBreath: { fill: 'var(--accent)', opacity: 0.35 },
  fallen: { fill: 'var(--accent)', opacity: 1 },
};

const WEEKDAY = ['월', '화', '수', '목', '금', '토', '일'];
export const dayLabel = (d: number): string => `${d + 1}일째 (${WEEKDAY[d % 7]})`;

/** 15분 칸마다 대표 상태 하나 */
function binStates(states: State[], from: number, bins: number, size: number): State[] {
  const out: State[] = [];
  for (let b = 0; b < bins; b++) {
    const c = { away: 0, active: 0, resting: 0, stillNoBreath: 0, fallen: 0 };
    for (let i = from + b * size; i < from + (b + 1) * size && i < states.length; i++) c[states[i]]++;
    let s: State;
    if (c.fallen > 0) s = 'fallen';
    else if (c.active >= 4) s = 'active';
    else if (c.away > size / 2) s = 'away';
    else if (c.stillNoBreath > size / 2) s = 'stillNoBreath';
    else if (c.away + c.active + c.resting + c.stillNoBreath === 0) s = 'away';
    else s = 'resting';
    out.push(s);
  }
  return out;
}

/** 같은 상태가 이어지는 칸을 한 사각형으로 */
function runs<T>(xs: T[]): { from: number; to: number; v: T }[] {
  const out: { from: number; to: number; v: T }[] = [];
  for (let i = 0; i < xs.length; i++) {
    const last = out[out.length - 1];
    if (last && last.v === xs[i]) last.to = i + 1;
    else out.push({ from: i, to: i + 1, v: xs[i] });
  }
  return out;
}

export function StateLegend({ withTruth = false }: { withTruth?: boolean }): JSX.Element {
  const item = 'inline-flex items-center gap-1.5';
  return (
    <p className="meta flex flex-wrap gap-x-4 gap-y-1" aria-hidden="true">
      {(['active', 'resting', 'stillNoBreath', 'fallen'] as const).map((s) => (
        <span key={s} className={item}>
          <svg width="14" height="10">
            <rect width="14" height="10" style={{ fill: FILL[s]?.fill }} opacity={FILL[s]?.opacity} />
          </svg>
          {STATE_LABEL[s]}
        </span>
      ))}
      <span className={item}>
        <svg width="14" height="10">
          <rect x="0.5" y="0.5" width="13" height="9" fill="none" style={{ stroke: 'var(--rule)' }} />
        </svg>
        빈칸 = 집에 없음
      </span>
      <span className={item}>
        <svg width="10" height="10">
          <circle cx="5" cy="5" r="4" style={{ fill: 'var(--accent)', stroke: 'var(--paper)' }} />
        </svg>
        알림
      </span>
      {withTruth && (
        <span className={item}>
          <svg width="10" height="10">
            <path d="M5 1 L9 9 L1 9 Z" style={{ fill: 'none', stroke: 'var(--ink)' }} strokeWidth={1.4} />
          </svg>
          정답(시뮬레이터만 앎)
        </span>
      )}
    </p>
  );
}

export interface RhythmProps {
  id: string;
  states: State[];
  days: number;
  baselineDays: number;
  incidents: Incident[];
  notices: Notice[];
  emergencyT: number | null;
  expectedWakes: (number | null)[];
  selectedDay: number;
  onSelectDay: (d: number) => void;
  w?: number;
}

/** 생활 리듬표: 한 줄이 하루, 가로가 0~24시. 평소 기상 시각(눈금)에서 벗어나는지 한눈에 본다. */
export function RhythmStrip({ id, states, days, baselineDays, incidents, notices, emergencyT, expectedWakes, selectedDay, onSelectDay, w = 720 }: RhythmProps): JSX.Element {
  const narrow = w < 500;
  const pad = { l: narrow ? 34 : 64, r: narrow ? 14 : 22, t: 20, b: 6 };
  const rowH = days > 30 ? 9 : 12;
  const H = pad.t + days * rowH + pad.b;
  const bins = 96;
  const cw = (w - pad.l - pad.r) / bins;
  const x = (minOfDay: number): number => pad.l + (minOfDay / DAY_MIN) * (w - pad.l - pad.r);
  const y = (d: number): number => pad.t + d * rowH;
  const hours = narrow ? [0, 6, 12, 18, 24] : [0, 3, 6, 9, 12, 15, 18, 21, 24];
  const alertDays = new Set(incidents.map((i) => Math.floor(i.t / DAY_MIN)));
  const desc =
    `생활 리듬표, ${days}일. 처음 ${baselineDays}일은 기준선 기간. ` +
    (incidents.length ? `알림 ${incidents.length}번(${[...alertDays].map((d) => d + 1).join('·')}일째). ` : '알림 없음. ') +
    (notices.length ? `활동 감소 요약 ${notices.length}번. ` : '');

  return (
    <svg viewBox={`0 0 ${w} ${H}`} width="100%" role="img" aria-labelledby={`${id}-d`} style={{ fontFamily: 'var(--font-sans)', display: 'block' }}>
      <title id={`${id}-d`}>{desc}</title>
      {hours.map((h) => (
        <g key={h}>
          <line x1={x(h * 60)} x2={x(h * 60)} y1={pad.t - 4} y2={H - pad.b} style={{ stroke: 'var(--rule)' }} strokeWidth={0.6} />
          <text x={x(h * 60)} y={pad.t - 8} textAnchor="middle" fontSize={11} style={{ fill: 'var(--muted)' }}>
            {h}시
          </text>
        </g>
      ))}
      {Array.from({ length: days }, (_, d) => {
        const row = binStates(states, d * DAY_MIN, bins, 15);
        const exp = expectedWakes[d];
        return (
          <g key={d}>
            {d % 7 === 0 && d !== baselineDays && (
              <text x={pad.l - 6} y={y(d) + rowH - 2} textAnchor="end" fontSize={11} style={{ fill: 'var(--muted)' }}>
                {narrow ? `${d + 1}` : `${d + 1}일째`}
              </text>
            )}
            {runs(row).map((r) => {
              const f = FILL[r.v];
              return f ? <rect key={r.from} x={pad.l + r.from * cw} y={y(d) + 1} width={(r.to - r.from) * cw} height={rowH - 2} style={{ fill: f.fill }} opacity={f.opacity} /> : null;
            })}
            {d >= baselineDays && exp !== null && (
              <line x1={x(exp)} x2={x(exp)} y1={y(d)} y2={y(d) + rowH} style={{ stroke: 'var(--ink)' }} strokeWidth={1.4} />
            )}
            {notices.some((n) => n.day === d) && <rect x={w - pad.r + 4} y={y(d) + 1} width={7} height={rowH - 2} style={{ fill: 'var(--accent)' }} />}
            <rect
              x={pad.l}
              y={y(d)}
              width={w - pad.l - pad.r}
              height={rowH}
              fill="transparent"
              style={{ cursor: 'pointer', stroke: d === selectedDay ? 'var(--ink)' : 'none' }}
              strokeWidth={1.2}
              onClick={() => onSelectDay(d)}
            />
          </g>
        );
      })}
      <line x1={pad.l - (narrow ? 2 : 4)} x2={w - pad.r} y1={y(baselineDays)} y2={y(baselineDays)} style={{ stroke: 'var(--accent)' }} strokeDasharray="4 3" strokeWidth={1.2} />
      {!narrow && (
        <text x={pad.l - 6} y={y(baselineDays) - 3} textAnchor="end" fontSize={10.5} style={{ fill: 'var(--accent)' }}>
          기준선 끝
        </text>
      )}
      {emergencyT !== null && emergencyT < days * DAY_MIN && (
        <path
          d={`M${x(emergencyT % DAY_MIN)} ${y(Math.floor(emergencyT / DAY_MIN)) + 1} l4 ${rowH - 2} h-8 z`}
          style={{ fill: 'var(--paper)', stroke: 'var(--ink)' }}
          strokeWidth={1.4}
        />
      )}
      {incidents.map((i) => (
        <circle key={i.id} cx={x(i.t % DAY_MIN)} cy={y(Math.floor(i.t / DAY_MIN)) + rowH / 2} r={Math.min(5, rowH / 2 + 0.5)} style={{ fill: 'var(--accent)', stroke: 'var(--paper)' }} strokeWidth={1.4} />
      ))}
    </svg>
  );
}

export interface DayProps {
  id: string;
  day: number;
  minutes: RadarMinute[];
  states: State[];
  incidents: Incident[];
  expectedWake: number | null;
  graceMin: number;
  emergencyT: number | null;
  w?: number;
}

/** 하루 확대: 상태 띠 · 움직임 세기 · 호흡 잡힘 · 쓰러짐 표시 · 알림 */
export function DayTimeline({ id, day, minutes, states, incidents, expectedWake, graceMin, emergencyT, w = 720 }: DayProps): JSX.Element {
  const narrow = w < 500;
  const pad = { l: narrow ? 8 : 78, r: 10, t: 34 };
  const band = { y: pad.t, h: 20 };
  const mot = { y: band.y + 30, h: 56 };
  const br = { y: mot.y + mot.h + 12, h: 10 };
  const fl = { y: br.y + br.h + 10, h: 10 };
  const H = fl.y + fl.h + 24;
  const base = day * DAY_MIN;
  const x = (m: number): number => pad.l + (m / DAY_MIN) * (w - pad.l - pad.r);
  const dayStates = states.slice(base, base + DAY_MIN);
  const dayMin = minutes.slice(base, base + DAY_MIN);
  const dayInc = incidents.filter((i) => i.t >= base && i.t < base + DAY_MIN);
  const motionPath = dayMin.map((m, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${(mot.y + mot.h - (m.motion / 100) * mot.h).toFixed(1)}`).join('');
  const breathPath = dayMin.map((m, i) => (m.breath !== null ? `M${x(i).toFixed(1)} ${br.y}v${br.h}` : '')).join('');
  const fallPath = dayMin.map((m, i) => (m.fall ? `M${x(i).toFixed(1)} ${fl.y}v${fl.h}` : '')).join('');
  const hours = narrow ? [0, 6, 12, 18, 24] : [0, 3, 6, 9, 12, 15, 18, 21, 24];
  const counts = dayStates.reduce<Record<State, number>>((a, s) => ({ ...a, [s]: a[s] + 1 }), { away: 0, active: 0, resting: 0, stillNoBreath: 0, fallen: 0 });
  const desc =
    `${dayLabel(day)} 하루. 움직임 ${counts.active}분, 정지+호흡 ${counts.resting}분, 정지+호흡 미검출 ${counts.stillNoBreath}분, 쓰러짐 표시 ${counts.fallen}분, 집에 없음 ${counts.away}분.` +
    (dayInc.length ? ` 알림 ${dayInc.map((i) => hm(i.t)).join(', ')}.` : ' 알림 없음.');
  const rowLabel = (yy: number, text: string): JSX.Element | null =>
    narrow ? null : (
      <text x={pad.l - 8} y={yy} textAnchor="end" fontSize={11.5} style={{ fill: 'var(--muted)' }}>
        {text}
      </text>
    );

  return (
    <svg viewBox={`0 0 ${w} ${H}`} width="100%" role="img" aria-labelledby={`${id}-d`} style={{ fontFamily: 'var(--font-sans)', display: 'block' }}>
      <title id={`${id}-d`}>{desc}</title>
      {hours.map((h) => (
        <g key={h}>
          <line x1={x(h * 60)} x2={x(h * 60)} y1={band.y - 4} y2={fl.y + fl.h} style={{ stroke: 'var(--rule)' }} strokeWidth={0.6} />
          <text x={Math.min(w - 14, Math.max(pad.l + 8, x(h * 60)))} y={H - 6} textAnchor="middle" fontSize={11} style={{ fill: 'var(--muted)' }}>
            {h}시
          </text>
        </g>
      ))}
      {rowLabel(band.y + 14, '상태')}
      {runs(dayStates).map((r) => {
        const f = FILL[r.v];
        return f ? <rect key={r.from} x={x(r.from)} y={band.y} width={Math.max(0.6, x(r.to) - x(r.from))} height={band.h} style={{ fill: f.fill }} opacity={f.opacity} /> : null;
      })}
      <rect x={pad.l} y={band.y} width={w - pad.l - pad.r} height={band.h} fill="none" style={{ stroke: 'var(--rule)' }} />
      {rowLabel(mot.y + mot.h / 2 + 4, '움직임 세기')}
      <line x1={pad.l} x2={w - pad.r} y1={mot.y + mot.h} y2={mot.y + mot.h} style={{ stroke: 'var(--rule)' }} />
      <line x1={pad.l} x2={w - pad.r} y1={mot.y + mot.h - 0.15 * mot.h} y2={mot.y + mot.h - 0.15 * mot.h} style={{ stroke: 'var(--muted)' }} strokeDasharray="2 3" strokeWidth={0.8} />
      <path d={motionPath} fill="none" style={{ stroke: 'var(--ink-2)' }} strokeWidth={0.9} />
      {rowLabel(br.y + 9, '호흡 잡힘')}
      <path d={breathPath} style={{ stroke: 'var(--ink-2)' }} strokeWidth={0.8} opacity={0.7} />
      {rowLabel(fl.y + 9, '쓰러짐 표시')}
      <path d={fallPath} style={{ stroke: 'var(--accent)' }} strokeWidth={1} />
      {expectedWake !== null && (
        <g>
          <line x1={x(expectedWake)} x2={x(expectedWake)} y1={band.y - 6} y2={fl.y + fl.h} style={{ stroke: 'var(--ink)' }} strokeDasharray="3 3" />
          <text x={x(expectedWake) + 4} y={mot.y + 10} fontSize={11} style={{ fill: 'var(--ink)' }}>
            평소 기상
          </text>
          {expectedWake + graceMin < DAY_MIN && (
            <line x1={x(expectedWake + graceMin)} x2={x(expectedWake + graceMin)} y1={band.y - 6} y2={band.y + band.h + 4} style={{ stroke: 'var(--muted)' }} strokeDasharray="1 2" />
          )}
        </g>
      )}
      {emergencyT !== null && emergencyT >= base && emergencyT < base + DAY_MIN && (
        <path d={`M${x(emergencyT - base)} ${band.y + band.h + 2} l5 9 h-10 z`} style={{ fill: 'var(--paper)', stroke: 'var(--ink)' }} strokeWidth={1.4} />
      )}
      {dayInc.map((i) => (
        <g key={i.id}>
          <line x1={x(i.t - base)} x2={x(i.t - base)} y1={band.y - 18} y2={fl.y + fl.h} style={{ stroke: 'var(--accent)' }} strokeWidth={1.6} />
          <rect x={x(i.t - base) - 9} y={band.y - 30} width={18} height={14} rx={3} style={{ fill: 'var(--accent)' }} />
          <text x={x(i.t - base)} y={band.y - 19.5} textAnchor="middle" fontSize={10.5} fontWeight={700} style={{ fill: 'var(--accent-contrast)' }}>
            {i.id}
          </text>
        </g>
      ))}
    </svg>
  );
}
