import { LEVEL_LABEL, SUSPECT_AT, pctText, type Level, type Verdict } from './verdict';

// 판별기 데모의 화면 조각. 상태는 AiCheckDemo가 갖고 여기는 그리기만 한다.
// 'use client'를 두지 않는다: AiCheckDemo(클라이언트)에서만 import되므로 클라이언트 번들에 들어가고,
// 진입 파일이 아니어야 함수 props 직렬화 경고(TS 71007)가 나지 않는다.

const LEVELS: Level[] = ['marked', 'suspect', 'unsure'];

// 판정마다 고유 신호색(lab.css의 --sig-*). 나머지 화면은 회색 뉴트럴이다.
const sig = (l: Level): string => `var(--sig-${l}, var(--accent))`;
const sigSoft = (l: Level): string => `var(--sig-${l}-soft, var(--accent-soft))`;

/** 결과 3단계를 나란히 보여 주고 지금 단계만 강조한다. 색만으로 구분하지 않게 "지금" 글자를 같이 쓴다. */
export function LevelScale({ level, score }: { level: Level; score: number | null }): JSX.Element {
  return (
    <ol className="list-none m-0 p-0 grid grid-cols-3 gap-1.5" aria-label="결과 3단계">
      {LEVELS.map((l) => {
        const on = l === level;
        const label = l === 'suspect' && on && score !== null ? `${LEVEL_LABEL[l]} ${pctText(score)}` : LEVEL_LABEL[l];
        return (
          <li
            key={l}
            aria-current={on ? 'step' : undefined}
            className="px-2.5 py-2 rounded-[var(--r-md)] text-[13.5px] leading-[1.35] font-semibold text-center"
            style={{
              border: `1px solid ${on ? sig(l) : 'var(--rule)'}`,
              background: on ? sigSoft(l) : 'transparent',
              color: on ? sig(l) : 'var(--muted)',
            }}
          >
            {label}
            {on && <span className="sr-only"> (지금 결과)</span>}
          </li>
        );
      })}
    </ol>
  );
}

export function VerdictCard({ verdict, score, title }: { verdict: Verdict; score: number | null; title: string }): JSX.Element {
  return (
    <section
      aria-labelledby="verdict-title"
      className="lab-exh p-5 grid gap-4"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="verdict-title" className="text-[17px] font-semibold" style={{ color: 'var(--ink)' }}>
          <span className="lab-mono text-[12px] font-normal mr-2" style={{ color: 'var(--muted)' }} aria-hidden="true">
            VERDICT
          </span>
          {title}
        </h2>
        <span className="meta">브라우저 안에서 판정</span>
      </div>
      <LevelScale level={verdict.level} score={score} />
      <p className="text-[18px] leading-[1.5] font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)' }} role="status">
        <span className="lab-mono" style={{ color: sig(verdict.level) }} aria-hidden="true">
          &gt;{' '}
        </span>
        {verdict.headline}
        <span key={verdict.headline} aria-hidden="true" className="lab-cursor" data-blink="" />
      </p>
      <div className="grid gap-1.5">
        <p className="meta">근거</p>
        <ul className="m-0 pl-5 grid gap-1.5 text-[14.5px] leading-[1.6]" style={{ color: 'var(--ink-2)' }}>
          {verdict.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
      {verdict.cautions.length > 0 && (
        <ul className="m-0 p-0 list-none grid gap-2">
          {verdict.cautions.map((c) => (
            <li key={c} className="pl-3 text-[14px] leading-[1.6]" style={{ borderLeft: '2px solid var(--rule-strong, var(--rule))', color: 'var(--ink)' }}>
              {c}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** 모델 점수 막대. 기준값 위치에 눈금을 긋는다. */
export function ScoreBar({ score, label }: { score: number | null; label: string }): JSX.Element {
  const pct = score === null ? null : Math.round(score * 100);
  const text = score === null ? null : pctText(score);
  return (
    <div className="grid gap-1">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[14px]" style={{ color: 'var(--ink-2)' }}>
          {label}
        </span>
        <span className="text-[15px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color: score === null ? 'var(--ink)' : sig(score >= SUSPECT_AT ? 'suspect' : 'unsure') }}>
          {text ?? '—'}
        </span>
      </div>
      <div
        className="relative h-2.5 rounded-full overflow-hidden"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--rule)' }}
        role="img"
        aria-label={pct === null ? `${label}: 아직 없음` : `${label}: AI일 확률 ${text}, 기준 ${Math.round(SUSPECT_AT * 100)}%`}
      >
        {pct !== null && <div className="absolute inset-y-0 left-0" style={{ width: `${pct}%`, background: sig(score !== null && score >= SUSPECT_AT ? 'suspect' : 'unsure') }} />}
        <div className="absolute inset-y-0 w-px" style={{ left: `${SUSPECT_AT * 100}%`, background: 'var(--ink)' }} aria-hidden="true" />
      </div>
    </div>
  );
}

export interface CheckRow {
  where: string;
  how: string;
  result: string;
  /** mark = AI 표시 찾음 */
  tone?: 'mark' | 'none' | 'info';
}

export function CheckTable({ rows, caption }: { rows: CheckRow[]; caption: string }): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[14.5px] leading-[1.55]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--ink-2)' }}>
            <th scope="col" className="text-left font-normal py-2 pr-3 w-[30%] meta">
              확인한 곳
            </th>
            <th scope="col" className="text-left font-normal py-2 meta">
              결과
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.where} style={{ borderBottom: '1px solid var(--rule)' }}>
              <th scope="row" className="text-left align-top py-2.5 pr-3 font-semibold" style={{ color: 'var(--ink)' }}>
                {r.where}
                <span className="block font-normal text-[12.5px] leading-[1.45]" style={{ color: 'var(--muted)' }}>
                  {r.how}
                </span>
              </th>
              <td className="align-top py-2.5" style={{ color: r.tone === 'mark' ? sig('marked') : r.tone === 'none' ? 'var(--muted)' : 'var(--ink)', fontWeight: r.tone === 'mark' ? 600 : 400 }}>
                {r.result}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface CompareRow {
  what: string;
  before: string;
  after: string;
  /** 압축 뒤 사라졌거나 크게 바뀐 줄 */
  changed?: boolean;
}

export function CompareTable({ rows }: { rows: CompareRow[] }): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[14.5px] leading-[1.55]">
        <caption className="sr-only">원본과 압축본 비교</caption>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--ink-2)' }}>
            <th scope="col" className="text-left font-normal py-2 pr-3 meta">
              항목
            </th>
            <th scope="col" className="text-left font-normal py-2 pr-3 meta">
              원본
            </th>
            <th scope="col" className="text-left font-normal py-2 meta" style={{ color: 'var(--ink)' }}>
              압축본
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.what} style={{ borderBottom: '1px solid var(--rule)' }}>
              <th scope="row" className="text-left align-top py-2.5 pr-3 font-semibold" style={{ color: 'var(--ink)' }}>
                {r.what}
              </th>
              <td className="align-top py-2.5 pr-3" style={{ color: 'var(--ink-2)' }}>
                {r.before}
              </td>
              <td className="align-top py-2.5" style={{ color: r.changed ? sig('suspect') : 'var(--ink)', fontWeight: r.changed ? 600 : 400 }}>
                {r.after}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Range({
  id,
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}): JSX.Element {
  return (
    <div className="grid gap-1">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[14.5px] font-semibold" style={{ color: 'var(--ink)' }}>
          {label}
        </label>
        <output htmlFor={id} className="text-[14px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>
          {value}
          {unit}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full min-h-0 p-0 border-0 bg-transparent cursor-pointer"
        style={{ accentColor: 'var(--accent)' }}
      />
    </div>
  );
}
