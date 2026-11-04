import Image from 'next/image';
import { CountUp, MotionScope } from '@/features/capstone/motion';
import { AiImageChip, Tag } from './LabParts';

// 증거 A: 로컬 모델로 만든 같은 그림의 왼쪽은 원본 PNG, 오른쪽은 SNS식으로 다시 저장한 사본(긴 변 1080px · JPEG 85 ·
// 메타데이터 없음, 실제로 그렇게 저장한 파일을 잘랐다). 눈으로는 같아 보이지만 표시가 사라진다.
// 아래 점수 막대는 본문 "예비 확인"의 값(Z-Image 그림 1장)이고, 이 견본 그림의 점수가 아니라고 밝힌다.
// 화면에 들어올 때 훑는 선이 한 번 지나가고 막대가 찬다(lab.css, 동작 줄이기면 정지 화면).

export default function AiCheckHeroVisual(): JSX.Element {
  return (
    <section id="exh-a" aria-labelledby="exh-a-title" className="lab-exh scroll-mt-24">
      <div className="lab-exh-head">
        <span>EXH-A · 2026-11 · 예비 확인</span>
        <Tag tone="amber">4장 · 통계 아님</Tag>
      </div>
      <MotionScope>
        <figure className="m-0">
          <div className="lab-photo">
            <Image
              src="/portfolio/capstone/aicheck-hero.webp"
              width={1024}
              height={768}
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              alt="AI로 만든 바닷가 마을 골목 그림. 흰 벽과 파란 덧창, 분홍 꽃 화분, 자갈길 끝에 바다가 보인다. 왼쪽 절반은 원본, 오른쪽 절반은 SNS식으로 다시 저장한 사본이다."
            />
            <div className="lab-split" aria-hidden="true">
              <Image src="/portfolio/capstone/aicheck-hero-sns.webp" width={1024} height={768} sizes="(min-width: 1024px) 560px, 100vw" alt="" />
            </div>
            <span aria-hidden="true" className="lab-divider" />
            <span aria-hidden="true" className="lab-scan" />
            <span className="lab-chip" style={{ left: 8, top: 8 }}>
              원본 PNG · AI 표시 있음
            </span>
            <span className="lab-chip" data-tone="amber" style={{ right: 8, top: 8 }}>
              SNS 사본 · 표시 사라짐
            </span>
            <AiImageChip />
          </div>
          <div className="lab-exh-body grid gap-3">
            <h2 id="exh-a-title" className="!mb-0 !text-[17px]">
              증거 A — 원본 vs SNS 사본
            </h2>
            <div className="grid gap-2" role="group" aria-label="판별 모델 점수 예시: 원본 99.8%, 다시 저장한 뒤 8.2%">
              <ScoreRow label="원본" to={0.998} pct={<CountUp to={99.8} decimals={1} />} />
              <ScoreRow
                label="1080px · JPEG 85"
                from={0.998}
                to={0.082}
                delay="0.9s"
                amber
                pct={<CountUp from={99.8} to={8.2} decimals={1} delay={900} />}
              />
            </div>
            <figcaption className="text-[13px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
              눈으로는 같아 보여도 다시 저장하면 표시가 사라지고 점수가 무너진다. 점수는 본문 예비 확인의 AI 그림 1장 값(데모 모델 · 4장 · 통계 아님)이고,
              위 견본 그림의 값은 아니다.
            </figcaption>
          </div>
        </figure>
      </MotionScope>
    </section>
  );
}

interface ScoreRowProps {
  label: string;
  from?: number;
  to: number;
  delay?: string;
  amber?: boolean;
  pct: React.ReactNode;
}

function ScoreRow({ label, from, to, delay, amber, pct }: ScoreRowProps): JSX.Element {
  return (
    <div className="grid grid-cols-[8.2rem_minmax(0,1fr)_3.6rem] items-center gap-3" aria-hidden="true">
      <span className="lab-mono text-[12.5px]" style={{ color: 'var(--ink-2)' }}>
        {label}
      </span>
      <span className="lab-bar" data-tone={amber ? 'amber' : undefined}>
        <span style={{ '--to': to, '--from': from ?? 0, '--delay': delay ?? '0.2s' } as React.CSSProperties} />
      </span>
      <span className="lab-mono text-right text-[15px] font-semibold" style={{ color: amber ? 'var(--amber)' : 'var(--accent)' }}>
        {pct}%
      </span>
    </div>
  );
}
