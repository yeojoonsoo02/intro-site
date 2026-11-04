// 작은 추세선. 숫자 축이 없는 "모양 예시"라서 값은 0~1로 정규화된 모양만 받는다.
// 선은 MotionScope 안에서 그려지며 나타난다(.sc-draw). 동작 줄이기면 처음부터 다 그려진 모양.

export type SparkShape = 'down' | 'up' | 'spike' | 'drop' | 'flat';

const N = 28;

/** 모양별 0~1 값. 앞 절반은 평소(잔잔한 흔들림), 뒤 절반에서 바뀐다. 무작위가 아니라 고정된 모양이다. */
function shape(kind: SparkShape): number[] {
  return Array.from({ length: N }, (_, i) => {
    const wob = Math.sin(i * 1.9) * 0.05 + Math.sin(i * 0.7) * 0.03;
    const k = Math.min(1, Math.max(0, (i - 13) / 12));
    switch (kind) {
      case 'down':
        return 0.62 - 0.42 * k + wob * 0.6;
      case 'drop':
        return 0.6 - 0.36 * k + wob;
      case 'up':
        return 0.36 + 0.46 * k + wob;
      case 'spike':
        return i >= 22 ? 0.55 + (i % 2 ? 0.32 : 0.18) : 0.38 + wob;
      default:
        return 0.48 + wob;
    }
  });
}

interface SparkProps {
  kind: SparkShape;
  width?: number;
  height?: number;
  /** 선 색(기본: 청록) */
  color?: string;
  /** 그리기 시작 지연(초) */
  delay?: number;
}

export default function Spark({ kind, width = 160, height = 40, color = 'var(--sc-teal)', delay = 0.2 }: SparkProps): JSX.Element {
  const vals = shape(kind);
  const x = (i: number): number => 2 + (i / (N - 1)) * (width - 4);
  const y = (v: number): number => 3 + (1 - v) * (height - 6);
  const d = `M${vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' L')}`;
  const last = vals[N - 1];
  return (
    <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false" className="block w-full h-auto overflow-visible">
      <line x1={x(13)} x2={x(13)} y1={0} y2={height} stroke="var(--sc-line)" strokeDasharray="2 3" />
      <path
        className="sc-draw"
        d={d}
        pathLength={1}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ '--d': `${delay}s` } as React.CSSProperties}
      />
      <circle className="sc-fade" cx={x(N - 1)} cy={y(last)} r={3} fill={color} style={{ '--d': `${delay + 0.8}s` } as React.CSSProperties} />
    </svg>
  );
}
