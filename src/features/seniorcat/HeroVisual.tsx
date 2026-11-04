import Image from 'next/image';
import { MotionScope } from '@/features/capstone/motion';
import { AiImageChip } from '@/features/capstone/CapstoneHero';
import { ONSET_SLOW } from './simulate';

// 첫 화면 그림: 저울 판 위 화장실 옆의 고양이 + 데모 '체중 감소' 시나리오 모양의 체중 선(그려지며 나타남).
// 선은 시나리오 설명(30일째부터 5주에 걸쳐 약 8%, 3.6kg → 약 3.3kg)을 그대로 그린 예시이고 실측이 아니다.

const W = 220;
const H = 78;
const DAYS = 70;
const KG_HI = 3.7;
const KG_LO = 3.2;
const START_KG = 3.6;
const DROP = 0.08;
const RAMP_DAYS = 35;

function kgAt(day: number): number {
  const k = Math.min(1, Math.max(0, (day - ONSET_SLOW) / RAMP_DAYS));
  // 매일 재는 값의 작은 흔들림(고정된 모양 — 무작위 아님)
  const wobble = Math.sin(day * 1.7) * 0.012 + Math.sin(day * 0.6) * 0.008;
  return START_KG * (1 - DROP * k) + wobble;
}

const x = (d: number): number => (d / DAYS) * W;
const y = (kg: number): number => ((KG_HI - kg) / (KG_HI - KG_LO)) * H;
const POINTS = Array.from({ length: DAYS + 1 }, (_, d) => `${x(d).toFixed(1)},${y(kgAt(d)).toFixed(1)}`);
const PATH = `M${POINTS.join(' L')}`;
const END = { x: x(DAYS), y: y(kgAt(DAYS)) };

export default function SeniorCatHeroVisual(): JSX.Element {
  return (
    <figure className="m-0">
      <MotionScope className="cap-photo">
        <Image
          src="/portfolio/capstone/seniorcat-hero.webp"
          width={1024}
          height={768}
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          alt="햇빛이 드는 거실 바닥. 회색 판 위에 놓인 베이지색 고양이 화장실 옆에 회색 줄무늬 고양이가 앉아 있다."
        />
        <div
          className="absolute grid gap-1 rounded-[10px] px-3 py-2.5"
          style={{ left: '4%', top: '5%', width: 'min(58%, 260px)', background: 'color-mix(in srgb, var(--surface) 90%, transparent)', boxShadow: 'var(--shadow)' }}
        >
          <p className="m-0 flex items-baseline justify-between gap-2 text-[12px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-2)' }}>
            <span>보리 · 체중 70일</span>
            <span style={{ color: 'var(--accent)' }}>−8%</span>
          </p>
          <svg viewBox={`-4 -6 ${W + 8} ${H + 12}`} className="w-full h-auto" role="img" aria-label="예시: 30일째부터 5주에 걸쳐 체중이 3.6kg에서 약 3.3kg으로 8% 줄어드는 선">
            <line x1={0} x2={W} y1={y(START_KG)} y2={y(START_KG)} stroke="var(--rule)" strokeDasharray="3 4" />
            <line x1={x(ONSET_SLOW)} x2={x(ONSET_SLOW)} y1={0} y2={H} stroke="var(--rule)" />
            <path className="cap-line" d={PATH} pathLength={1} fill="none" stroke="var(--accent)" strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
            <circle className="cap-dot" cx={END.x} cy={END.y} r={4} fill="var(--accent)" />
          </svg>
          <p className="m-0 text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
            3.6kg → 약 3.3kg · 시뮬레이션 예시
          </p>
        </div>
        <AiImageChip />
      </MotionScope>
      <figcaption className="mt-2 text-[13px] leading-[1.5]" style={{ color: 'var(--muted)' }}>
        화장실 밑 저울이 매일 적은 체중이 평소에서 벗어나면, 보호자가 눈치채기 전에 알린다.
      </figcaption>
    </figure>
  );
}
