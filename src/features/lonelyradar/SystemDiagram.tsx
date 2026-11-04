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
  id: string;
  d: string;
  label?: string;
  lx?: number;
  ly?: number;
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

function Arrow({ e, marker }: { e: Edge; marker: string }): JSX.Element {
  return (
    <g>
      <path d={e.d} fill="none" style={{ stroke: 'var(--muted)' }} strokeWidth={1.3} markerEnd={`url(#${marker})`} />
      {e.label && (
        <text x={e.lx} y={e.ly} textAnchor={e.anchor ?? 'middle'} style={{ fill: 'var(--muted)' }} fontSize={12}>
          {e.label}
        </text>
      )}
    </g>
  );
}

function Diagram({ id, width, height, boxes, edges }: { id: string; width: number; height: number; boxes: Box[]; edges: Edge[] }): JSX.Element {
  const marker = `${id}-arrow`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-labelledby={`${id}-desc`} style={{ fontFamily: 'var(--font-sans)' }}>
      <title id={`${id}-desc`}>
        시스템 구성: 침대 위 레이더(호흡·심박·재실)와 천장 레이더(쓰러짐·바닥 점유)가 1분마다 상태 값만 와이파이로 서버에 보낸다. 서버가 상태 머신으로 지금
        상태를 정하고, 개인 기준선과 비교해 벗어나면 본인 폰에 먼저 묻고, 10분 안에 답이 없으면 관리자, 다시 30분 뒤 비상 연락처에 알린다. 영상과 소리는 없다.
      </title>
      <defs>
        <marker id={marker} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" style={{ fill: 'var(--muted)' }} />
        </marker>
      </defs>
      {edges.map((e) => (
        <Arrow key={e.id} e={e} marker={marker} />
      ))}
      {boxes.map((b) => (
        <Node key={b.title} b={b} />
      ))}
    </svg>
  );
}

const BED = { title: '침대 위 레이더', lines: ['MR60BHA2 · 60GHz', '호흡·심박·재실', '머리 위 1m · 45°'] };
const CEIL = { title: '천장 레이더', lines: ['MR60FDA2 · 60GHz', '쓰러짐·바닥 점유', '높이 2.2~3.0m'] };
const SERVER = { title: '서버 — 판단', lines: ['상태 머신 (움직임·정지+호흡·쓰러짐)', '개인 기준선 (기상·취침·정지 시간)', '이탈 규칙 · 단계 타이머'] };
const SELF = { title: '1 본인 폰', lines: ['"괜찮으세요?"', '누르면 여기서 끝'] };
const MANAGER = { title: '2 관리자', lines: ['10분 답이 없으면', '임대인·관리사무소'] };
const CONTACT = { title: '3 비상 연락처', lines: ['다시 30분 뒤', '가족·지인 · 119'] };

const WIDE: { boxes: Box[]; edges: Edge[] } = {
  boxes: [
    { x: 60, y: 10, w: 230, h: 100, ...BED },
    { x: 350, y: 10, w: 230, h: 100, ...CEIL },
    { x: 150, y: 152, w: 340, h: 104, accent: true, ...SERVER },
    { x: 6, y: 300, w: 196, h: 80, ...SELF },
    { x: 222, y: 300, w: 196, h: 80, ...MANAGER },
    { x: 438, y: 300, w: 196, h: 80, ...CONTACT },
  ],
  edges: [
    { id: 'bed', d: 'M175 112 L250 150' },
    { id: 'ceil', d: 'M465 112 L390 150', label: '1분 상태값 · Wi-Fi', lx: 320, ly: 134 },
    { id: 'alert', d: 'M320 258 C 320 286, 104 276, 104 298', label: '이탈하면', lx: 330, ly: 282, anchor: 'start' },
    { id: 's-m', d: 'M203 340 L220 340' },
    { id: 'm-c', d: 'M419 340 L436 340' },
  ],
};

const TALL: { boxes: Box[]; edges: Edge[] } = {
  boxes: [
    { x: 6, y: 8, w: 170, h: 100, ...BED, lines: ['MR60BHA2', '호흡·심박·재실', '머리 위 1m·45°'] },
    { x: 184, y: 8, w: 170, h: 100, ...CEIL, lines: ['MR60FDA2', '쓰러짐·바닥 점유', '천장 2.2~3.0m'] },
    { x: 6, y: 152, w: 348, h: 104, accent: true, ...SERVER },
    { x: 30, y: 300, w: 300, h: 80, ...SELF },
    { x: 30, y: 414, w: 300, h: 80, ...MANAGER },
    { x: 30, y: 528, w: 300, h: 80, ...CONTACT },
  ],
  edges: [
    { id: 'bed', d: 'M91 110 L150 150' },
    { id: 'ceil', d: 'M269 110 L210 150', label: 'Wi-Fi', lx: 180, ly: 136 },
    { id: 'alert', d: 'M180 258 L180 298', label: '이탈', lx: 190, ly: 283, anchor: 'start' },
    { id: 's-m', d: 'M180 382 L180 412', label: '답 없음', lx: 190, ly: 401, anchor: 'start' },
    { id: 'm-c', d: 'M180 496 L180 526', label: '해결 안 됨', lx: 190, ly: 515, anchor: 'start' },
  ],
};

export default function SystemDiagram(): JSX.Element {
  return (
    <figure className="m-0">
      <div className="hidden sm:block">
        <Diagram id="radar-wide" width={640} height={388} {...WIDE} />
      </div>
      <div className="sm:hidden">
        <Diagram id="radar-tall" width={360} height={616} {...TALL} />
      </div>
      <figcaption className="mt-3 text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
        키트마다 XIAO ESP32-C6가 붙어 있어 레이더가 계산한 결과(재실·움직임·호흡수·쓰러짐)만 보낸다. 기준선·규칙·알림은 서버에서 해서, 문턱값을 바꿔도 기기를
        다시 굽지 않는다. 카메라·마이크는 없다.
      </figcaption>
    </figure>
  );
}
