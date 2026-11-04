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
        시스템 구성: 화장실 밑 로드셀 4개의 무게를 HX711이 읽고, ESP32가 방문(들어옴·머묾·나감)과 모래 무게 변화를 잘라 와이파이로 서버에 보낸다. 서버가
        체중으로 고양이를 구분하고 고양이별 기준선과 비교해 알림을 보내며, 보호자는 폰에서 알림과 병원 리포트를 본다.
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

const SCALE = { title: '화장실 밑 저울', lines: ['로드셀 4개 (모서리)', 'HX711 24비트 ADC', '10Hz로 읽기'] };
const MCU = { title: 'ESP32 (기기)', lines: ['평균 → 1초 값', '방문 잘라내기', '평소엔 10분에 1번'] };
const SERVER = { title: '서버 — 판단', lines: ['체중으로 고양이 구분', '고양이별 기준선', 'CUSUM 변화점 · 급한 규칙', '원신호 보관'] };
const PHONE = { title: '보호자 폰', lines: ['행동 변화 알림', '병원 리포트 (1쪽)'] };

const WIDE: { boxes: Box[]; edges: Edge[] } = {
  boxes: [
    { x: 6, y: 70, w: 168, h: 106, ...SCALE },
    { x: 214, y: 70, w: 156, h: 106, ...MCU },
    { x: 412, y: 60, w: 204, h: 126, accent: true, ...SERVER },
    { x: 412, y: 226, w: 204, h: 80, ...PHONE },
  ],
  edges: [
    { d: 'M176 123 L212 123', label: '무게', lx: 194, ly: 113 },
    { d: 'M372 123 L410 123', label: 'Wi-Fi', lx: 391, ly: 113 },
    { d: 'M514 188 L514 224', label: '알림', lx: 524, ly: 211, anchor: 'start' },
  ],
};

const TALL: { boxes: Box[]; edges: Edge[] } = {
  boxes: [
    { x: 30, y: 8, w: 300, h: 106, ...SCALE },
    { x: 30, y: 158, w: 300, h: 106, ...MCU },
    { x: 30, y: 308, w: 300, h: 126, accent: true, ...SERVER },
    { x: 30, y: 478, w: 300, h: 80, ...PHONE },
  ],
  edges: [
    { d: 'M180 116 L180 156', label: '무게', lx: 190, ly: 141, anchor: 'start' },
    { d: 'M180 266 L180 306', label: 'Wi-Fi', lx: 190, ly: 291, anchor: 'start' },
    { d: 'M180 436 L180 476', label: '알림', lx: 190, ly: 461, anchor: 'start' },
  ],
};

export default function SystemDiagram(): JSX.Element {
  return (
    <figure className="m-0">
      <div className="hidden sm:block">
        <Diagram id="cat-wide" width={622} height={314} {...WIDE} />
      </div>
      <div className="sm:hidden">
        <Diagram id="cat-tall" width={360} height={566} {...TALL} />
      </div>
      <figcaption className="mt-3 text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
        기기는 무게를 읽고 방문을 잘라 보내는 일만 한다. 고양이 구분·기준선·알림은 서버에서 해서, 규칙을 바꿔도 기기를 다시 굽지 않는다. 카메라·마이크는
        없다.
      </figcaption>
    </figure>
  );
}
