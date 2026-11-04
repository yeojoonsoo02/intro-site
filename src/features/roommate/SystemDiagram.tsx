// 시스템 구성도. 색은 전부 사이트 토큰(var(--ink) 등)이라 라이트·다크 모두 따라간다.
// 좁은 화면에서 가로 그림을 줄이면 글자가 10px 아래로 작아져서, 세로판을 따로 그린다.

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines: string[];
  accent?: boolean;
}

interface Edge {
  d: string;
  label: string;
  lx: number;
  ly: number;
  anchor?: 'start' | 'middle' | 'end';
  both?: boolean;
}

function Node({ b }: { b: Box }): JSX.Element {
  return (
    <g>
      <rect
        x={b.x}
        y={b.y}
        width={b.w}
        height={b.h}
        rx={10}
        style={{ fill: b.accent ? 'var(--accent-soft)' : 'var(--surface)', stroke: b.accent ? 'var(--accent)' : 'var(--ink-2)' }}
        strokeWidth={b.accent ? 1.6 : 1}
      />
      <text x={b.x + 14} y={b.y + 26} style={{ fill: b.accent ? 'var(--accent)' : 'var(--ink)' }} fontSize={15} fontWeight={700}>
        {b.title}
      </text>
      {b.lines.map((line, i) => (
        <text key={line} x={b.x + 14} y={b.y + 48 + i * 19} style={{ fill: 'var(--ink-2)' }} fontSize={13}>
          {line}
        </text>
      ))}
    </g>
  );
}

function Link({ e, marker }: { e: Edge; marker: string }): JSX.Element {
  return (
    <g>
      <path
        d={e.d}
        fill="none"
        style={{ stroke: 'var(--muted)' }}
        strokeWidth={1.3}
        markerEnd={`url(#${marker})`}
        markerStart={e.both ? `url(#${marker})` : undefined}
      />
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
        시스템 구성: 기기(레이더·버튼·LED·마이크·스피커)와 폰(BLE 근접 감지)이 서버에 신호를 보내고, 서버가 말 걸 때를 정하고 틀린 표현을 기억하며, 대화 문장은 클라우드 LLM API가 만든다.
      </title>
      <defs>
        <marker id={marker} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" style={{ fill: 'var(--muted)' }} />
        </marker>
      </defs>
      {edges.map((e) => (
        <Link key={e.label} e={e} marker={marker} />
      ))}
      {boxes.map((b) => (
        <Node key={b.title} b={b} />
      ))}
    </svg>
  );
}

const PHONE = { title: '폰 (웹앱)', lines: ['BLE 비콘 감지', '= 누가 왔나'] };
const DEVICE = { title: '기기 (ESP32-S3)', lines: ['레이더 = 방에 있나', '버튼 2개 · 마이크 LED', '마이크 · 스피커'] };
const SERVER = { title: '서버 — 같은 엔진', lines: ['말 걸 때 판단', '틀린 표현 기억', '복습 일정 (간격 반복)', 'LLM 키는 서버에만'] };
const LLM = { title: 'LLM API', lines: ['대화 문장 생성', 'Claude Haiku 5.5'] };

const WIDE: { boxes: Box[]; edges: Edge[] } = {
  boxes: [
    { x: 10, y: 14, w: 190, h: 86, ...PHONE },
    { x: 10, y: 196, w: 190, h: 106, ...DEVICE },
    { x: 290, y: 98, w: 220, h: 128, accent: true, ...SERVER },
    { x: 590, y: 122, w: 160, h: 80, ...LLM },
  ],
  edges: [
    { d: 'M105 194 L105 102', label: 'BLE 비콘', lx: 115, ly: 152, anchor: 'start' },
    { d: 'M202 57 C 250 57, 250 130, 288 130', label: '들어옴', lx: 212, ly: 48, anchor: 'start' },
    { d: 'M202 250 C 250 250, 250 194, 288 194', label: '감지·말(글)', lx: 248, ly: 268, both: true },
    { d: 'M512 162 L588 162', label: '대화', lx: 550, ly: 152, both: true },
  ],
};

const TALL: { boxes: Box[]; edges: Edge[] } = {
  boxes: [
    { x: 6, y: 10, w: 150, h: 86, ...PHONE, lines: ['BLE 비콘 감지', '= 누가 왔나'] },
    { x: 186, y: 10, w: 168, h: 106, ...DEVICE, lines: ['레이더 = 방에 있나', '버튼 · 마이크 LED', '마이크 · 스피커'] },
    { x: 40, y: 190, w: 280, h: 128, accent: true, ...SERVER },
    { x: 80, y: 404, w: 200, h: 80, ...LLM },
  ],
  edges: [
    { d: 'M184 50 L158 50', label: 'BLE', lx: 171, ly: 40 },
    { d: 'M81 98 L81 188', label: '들어옴', lx: 90, ly: 150, anchor: 'start' },
    { d: 'M270 118 L270 188', label: '감지·말(글)', lx: 278, ly: 158, anchor: 'start', both: true },
    { d: 'M180 320 L180 402', label: '대화', lx: 190, ly: 366, anchor: 'start', both: true },
  ],
};

export default function SystemDiagram(): JSX.Element {
  return (
    <figure className="m-0">
      <div className="hidden sm:block">
        <Diagram id="sys-wide" width={760} height={316} {...WIDE} />
      </div>
      <div className="sm:hidden">
        <Diagram id="sys-tall" width={360} height={494} {...TALL} />
      </div>
      <figcaption className="mt-3 text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
        폰은 &ldquo;누구&rdquo;, 레이더는 &ldquo;정말 방에 있는지&rdquo;를 맡는다. 받아쓰기·음성 합성은 기기나 브라우저에서 하고, 서버와는 글로
        주고받는다. 폰 웹앱·노트북·전용 기기가 같은 서버 엔진을 쓴다.
      </figcaption>
    </figure>
  );
}
