import './capstone.css';

// 졸업작품 구상 페이지 4개의 첫 화면. 레이아웃·글꼴은 사이트 공통이고, 프로젝트마다 다른 건
// 강조색(<main class="cap cap-*">)과 오른쪽 그림(visual)·큰 숫자(stats)뿐이다.
// 숫자는 각 페이지 본문에 이미 있는 값만, 출처·상태 표시와 같이 쓴다.

export interface HeroStat {
  /** 큰 숫자(CountUp 등) */
  value: React.ReactNode;
  /** 숫자 뒤 작은 단위 */
  unit?: string;
  label: string;
  /** 출처·상태 (예: "추정", "Cornell", "시뮬레이션") */
  source: string;
}

interface CapstoneHeroProps {
  title: string;
  subtitle?: string;
  concept: React.ReactNode;
  visual: React.ReactNode;
  stats: HeroStat[];
  actions: React.ReactNode;
  status?: string;
}

const LABEL = 'text-[12.5px] tracking-[.03em]';
const MONO_MUTED = { fontFamily: 'var(--font-mono)', color: 'var(--muted)' } as const;

export default function CapstoneHero({ title, subtitle, concept, visual, stats, actions, status = '구상 · 웹 데모' }: CapstoneHeroProps): JSX.Element {
  return (
    <header className="mb-14 sm:mb-16">
      <div className="grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-12 lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4">
            <span className={LABEL} style={MONO_MUTED}>
              졸업작품 구상
            </span>
            <span className={`inline-flex items-center gap-1.5 ${LABEL}`} style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
              {status}
            </span>
          </div>
          <h1
            className={`text-[32px] sm:text-[42px] font-bold leading-[1.18] ${subtitle ? 'mb-2' : 'mb-5'}`}
            style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)', textWrap: 'balance' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-[18px] sm:text-[20px] leading-[1.45] mb-5" style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-2)', textWrap: 'balance' }}>
              {subtitle}
            </p>
          )}
          <p className="intro-p text-[18px] sm:text-[19px] leading-[1.65] max-w-[44ch] mb-6" style={{ color: 'var(--ink)' }}>
            {concept}
          </p>
          <div className="flex flex-wrap gap-3">{actions}</div>
        </div>
        <div className="min-w-0">{visual}</div>
      </div>

      <dl
        className="m-0 mt-9 grid gap-x-8 gap-y-6 pt-6"
        style={{ borderTop: '1px solid var(--rule)', gridTemplateColumns: `repeat(auto-fit, minmax(${stats.length > 2 ? 200 : 260}px, 1fr))` }}
      >
        {stats.map((s) => (
          // 읽는 순서는 이름 → 값(dl 규칙), 보이는 순서는 값이 먼저
          <div key={s.label} className="grid content-start gap-1.5 pl-4" style={{ borderLeft: '3px solid var(--accent)' }}>
            <dt className="order-2 text-[15px] leading-[1.5]" style={{ color: 'var(--ink)' }}>
              {s.label}
            </dt>
            <dd className="m-0 order-1 leading-none" style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent)', letterSpacing: '-0.02em' }}>
              <span className="text-[34px] sm:text-[40px] font-bold">{s.value}</span>
              {s.unit && <span className="ml-1 text-[17px] sm:text-[19px] font-semibold">{s.unit}</span>}
            </dd>
            <dd className="m-0 order-3 text-[12.5px] leading-[1.45]" style={MONO_MUTED}>
              {s.source}
            </dd>
          </div>
        ))}
      </dl>
    </header>
  );
}

/** 생성 이미지 옆에 붙이는 작은 표시. 사진 오른쪽 아래 구석에 둔다. */
export function AiImageChip({ model = 'FLUX.2 klein' }: { model?: string }): JSX.Element {
  return (
    <span className="cap-chip" style={{ right: 8, bottom: 8 }}>
      AI 이미지 · 로컬 {model}
    </span>
  );
}

/** 페이지 끝 각주: 이 페이지의 사진이 생성 이미지임을 밝힌다. */
export function AiImageFootnote(): JSX.Element {
  return (
    <p className="mt-6 text-[13px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
      이 페이지의 사진은 실제 촬영이 아니라, 이 작업용 맥에서 오픈소스 모델(FLUX.2 klein 4B, Apache-2.0)로 만든 AI 이미지입니다. 사람·실제 제품은 나오지
      않습니다.
    </p>
  );
}
