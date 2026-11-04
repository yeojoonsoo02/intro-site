import type { Signal } from './LabParts';

// 두 단계 판별 흐름도. 색은 전부 토큰(var(--ink) 등)이고, 결과 상자 셋만 판정 신호색(var(--sig-*))을 쓴다.
// 좁은 화면에서 가로 그림을 줄이면 글자가 10px 아래로 작아져서, 세로판을 따로 그리고 글 요약 뒤에 접어 둔다.

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines: string[];
  /** 결과 상자(굵은 테두리) */
  result?: boolean;
  /** 결과 상자의 판정 신호 */
  sig?: Signal;
  tag?: string;
}

interface Edge {
  d: string;
  label: string;
  lx: number;
  ly: number;
  anchor?: 'start' | 'middle' | 'end';
}

function Node({ b }: { b: Box }): JSX.Element {
  const color = b.sig ? `var(--sig-${b.sig})` : undefined;
  const stroke = color ?? 'var(--ink-2)';
  return (
    <g>
      <rect
        x={b.x}
        y={b.y}
        width={b.w}
        height={b.h}
        rx={10}
        style={{ fill: b.sig ? `var(--sig-${b.sig}-soft)` : 'var(--surface)', stroke }}
        strokeWidth={b.result ? 1.6 : 1}
      />
      <text x={b.x + 14} y={b.y + 26} style={{ fill: color ?? 'var(--ink)' }} fontSize={15} fontWeight={700}>
        {b.title}
      </text>
      {b.tag && (
        <text x={b.x + b.w - 12} y={b.y + 26} textAnchor="end" style={{ fill: 'var(--muted)', fontFamily: 'var(--font-mono)' }} fontSize={12}>
          {b.tag}
        </text>
      )}
      {b.lines.map((line, i) => (
        <text key={line} x={b.x + 14} y={b.y + 48 + i * 19} style={{ fill: 'var(--ink-2)' }} fontSize={13}>
          {line}
        </text>
      ))}
    </g>
  );
}

function Arrow({ e, marker }: { e: Edge; marker: string }): JSX.Element {
  return (
    <g>
      <path d={e.d} fill="none" style={{ stroke: 'var(--muted)' }} strokeWidth={1.3} markerEnd={`url(#${marker})`} />
      <text x={e.lx} y={e.ly} textAnchor={e.anchor ?? 'middle'} style={{ fill: 'var(--muted)' }} fontSize={12}>
        {e.label}
      </text>
    </g>
  );
}

function Diagram({ id, width, height, boxes, edges }: { id: string; width: number; height: number; boxes: Box[]; edges: Edge[] }): JSX.Element {
  const marker = `${id}-arrow`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-labelledby={`${id}-desc`} style={{ fontFamily: 'var(--font-sans)' }}>
      <title id={`${id}-desc`}>
        두 단계 판별: SNS에서 받은 사본을 먼저 1단계(C2PA 출처 정보·보이지 않는 워터마크·화면 문구)로 확인해 표시가 있으면 &ldquo;AI 표시
        확인됨&rdquo;. 표시가 없으면 2단계(압축에 강하게 학습한 판별 모델과 근거 문장)로 넘어가 점수가 높으면 &ldquo;AI 의심 N%와 근거&rdquo;, 그
        밖에는 &ldquo;판단 어려움&rdquo;.
      </title>
      <defs>
        <marker id={marker} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" style={{ fill: 'var(--muted)' }} />
        </marker>
      </defs>
      {edges.map((e) => (
        <Arrow key={e.label} e={e} marker={marker} />
      ))}
      {boxes.map((b) => (
        <Node key={b.title} b={b} />
      ))}
    </svg>
  );
}

const INPUT = { title: 'SNS 사본', lines: ['공유받은 이미지', '(영상은 다음 단계)'] };
const L1 = { title: '1단계 · 표시 확인', tag: '확실', lines: ['C2PA 출처 정보', '보이지 않는 워터마크', '화면 속 “AI 생성” 문구'] };
const L2 = { title: '2단계 · 내용 판별', tag: '확률', lines: ['압축에 강하게 학습한 판별 모델', 'VLM이 근거 문장을 붙임', '점수 + 근거'] };
const R1: Pick<Box, 'title' | 'lines' | 'sig' | 'result'> = { title: 'AI 표시 확인됨', lines: ['어디에 무슨 표시인지'], sig: 'marked', result: true };
const R2: Pick<Box, 'title' | 'lines' | 'sig' | 'result'> = { title: 'AI 의심 N%', lines: ['+ 근거 문장'], sig: 'suspect', result: true };
const R3: Pick<Box, 'title' | 'lines' | 'sig' | 'result'> = { title: '판단 어려움', lines: ['모르면 모른다고'], sig: 'unsure', result: true };

const WIDE: { boxes: Box[]; edges: Edge[] } = {
  boxes: [
    { x: 10, y: 128, w: 150, h: 76, ...INPUT },
    { x: 220, y: 14, w: 260, h: 124, ...L1 },
    { x: 220, y: 196, w: 260, h: 124, ...L2 },
    { x: 570, y: 44, w: 180, h: 64, ...R1 },
    { x: 570, y: 176, w: 180, h: 64, ...R2 },
    { x: 570, y: 258, w: 180, h: 64, ...R3 },
  ],
  edges: [
    { d: 'M162 166 C 192 166, 192 76, 218 76', label: '먼저', lx: 176, ly: 112, anchor: 'end' },
    { d: 'M350 140 L350 194', label: '표시 없음', lx: 360, ly: 172, anchor: 'start' },
    { d: 'M482 76 L568 76', label: '표시 있음', lx: 525, ly: 66 },
    { d: 'M482 236 C 525 236, 525 208, 568 208', label: '점수 높음', lx: 525, ly: 200 },
    { d: 'M482 280 C 525 280, 525 290, 568 290', label: '그 밖', lx: 525, ly: 304 },
  ],
};

const TALL: { boxes: Box[]; edges: Edge[] } = {
  boxes: [
    { x: 100, y: 8, w: 160, h: 76, ...INPUT },
    { x: 20, y: 120, w: 320, h: 92, ...L1, lines: ['C2PA 출처 정보 · 워터마크', '화면 속 “AI 생성” 문구'] },
    { x: 8, y: 270, w: 160, h: 64, ...R1, lines: ['표시를 보여 줌'] },
    { x: 20, y: 388, w: 320, h: 92, ...L2, lines: ['압축에 강하게 학습한 모델', 'VLM이 근거 문장을 붙임'] },
    { x: 8, y: 536, w: 164, h: 64, ...R2 },
    { x: 188, y: 536, w: 164, h: 64, ...R3 },
  ],
  edges: [
    { d: 'M180 86 L180 118', label: '먼저', lx: 190, ly: 106, anchor: 'start' },
    { d: 'M88 214 L88 268', label: '표시 있음', lx: 98, ly: 246, anchor: 'start' },
    { d: 'M290 214 L290 386', label: '표시 없음', lx: 280, ly: 310, anchor: 'end' },
    { d: 'M90 482 L90 534', label: '점수 높음', lx: 100, ly: 512, anchor: 'start' },
    { d: 'M270 482 L270 534', label: '그 밖', lx: 280, ly: 512, anchor: 'start' },
  ],
};

export default function FlowDiagram(): JSX.Element {
  return (
    <figure className="m-0">
      <div className="hidden sm:block">
        <Diagram id="flow-wide" width={760} height={330} {...WIDE} />
      </div>
      <div className="sm:hidden grid gap-1">
        <ol className="m-0 pl-5 grid gap-1 text-[14.5px] leading-[1.6]" style={{ color: 'var(--ink-2)' }}>
          <li>
            1단계 표시 확인 → 표시 있음: <span className="lab-sig" data-sig="marked">AI 표시 확인됨</span>
          </li>
          <li>
            표시 없음 → 2단계 내용 판별 → 점수 높음: <span className="lab-sig" data-sig="suspect">AI 의심 N%</span> · 그 밖:{' '}
            <span className="lab-sig" data-sig="unsure">판단 어려움</span>
          </li>
        </ol>
        <details className="lab-toggle">
          <summary>흐름도 보기</summary>
          <div className="lab-toggle-body">
            <Diagram id="flow-tall" width={360} height={608} {...TALL} />
          </div>
        </details>
      </div>
      <figcaption className="mt-3 text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
        표시가 있으면 그걸 보여 주는 것으로 끝난다. 표시가 없다고 사람이 만든 것은 아니어서, 그때만 그림 자체를 판별하고 확률과 근거로 말한다.
        &ldquo;가짜&rdquo;라고 단정하는 칸은 없다.
      </figcaption>
    </figure>
  );
}
