import Image from 'next/image';
import { CountUp, MotionScope } from '@/features/capstone/motion';
import Spark from './Spark';

// 첫 화면 그림: 거실 사진(로컬 AI 이미지, 고양이가 오른쪽에 있어 폰은 왼쪽에 겹친다) 옆에, 이 구상이 될 "보호자 앱" 홈 화면을 HTML·CSS로 그린 폰 목업.
// 폰 안의 숫자는 데모 '체중 감소'·'소변 증가' 시나리오 모양을 따른 설명용 예시이고 실측이 아니다 — 화면 안에 그렇게 적는다.
// 화면에 들어오면 숫자가 세어 올라가고 체중 선이 그려진 뒤 알림이 천천히 뜬다(동작 줄이기면 처음부터 최종 모습).

export default function AppHero(): JSX.Element {
  return (
    <MotionScope className="sc-stage">
      <figure className="m-0">
        <div className="sc-photo">
          <Image
            src="/portfolio/capstone/seniorcat-hero.webp"
            width={1024}
            height={768}
            priority
            sizes="(min-width: 1024px) 470px, 100vw"
            alt="햇빛이 드는 거실 바닥. 회색 판 위에 놓인 베이지색 고양이 화장실 옆에 회색 줄무늬 고양이가 앉아 있다."
          />
          <span className="sc-chip" style={{ right: 10, top: 10 }}>
            AI 이미지 · 로컬 FLUX.2 klein
          </span>
        </div>
        <figcaption className="sr-only">화장실 밑 저울이 매일 적은 기록을 보호자 앱이 보여 주는 모습(예시 화면).</figcaption>
      </figure>

      <figure className="sc-phone" aria-labelledby="sc-phone-cap">
        <div className="sc-screen" aria-hidden="true">
          <div className="sc-island" aria-hidden="true" />
          <p className="m-0 mb-2 text-center">
            <span className="sc-pill sc-pill-quiet" style={{ fontSize: 11.5, padding: '2px 9px' }}>
              예시 화면 · 시뮬레이션 수치
            </span>
          </p>
          <div className="flex items-center gap-2.5 mb-2.5">
            <Image src="/portfolio/senior-cat/bori-avatar.webp" width={38} height={38} alt="" className="sc-avatar" />
            <div className="min-w-0">
              <p className="m-0 text-[15px] font-bold leading-tight" style={{ color: 'var(--sc-ink)' }}>
                보리 (13살)
              </p>
              <p className="m-0 text-[11.5px] leading-tight mt-0.5" style={{ color: 'var(--sc-muted)' }}>
                화장실 기록 · 오늘
              </p>
            </div>
          </div>

          <div className="sc-screen-card grid gap-2">
            <p className="m-0 text-[11.5px] font-semibold" style={{ color: 'var(--sc-muted)' }}>
              오늘 카드
            </p>
            <p className="m-0 flex items-baseline gap-1.5" style={{ color: 'var(--sc-ink)' }}>
              <span className="text-[12.5px]">오늘 소변</span>
              <span className="text-[26px] font-bold leading-none" style={{ color: 'var(--sc-teal)' }}>
                <CountUp to={5} delay={150} duration={700} />
              </span>
              <span className="text-[12.5px] font-semibold">회</span>
              <span className="ml-auto text-[12px]" style={{ color: 'var(--sc-muted)' }}>
                평소 3회
              </span>
            </p>
            <div className="h-px" style={{ background: 'var(--sc-line)' }} aria-hidden="true" />
            <p className="m-0 flex items-baseline gap-1.5" style={{ color: 'var(--sc-ink)' }}>
              <span className="text-[12.5px]">체중</span>
              <span className="text-[20px] font-bold leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
                <CountUp to={3.31} decimals={2} delay={250} duration={800} />
              </span>
              <span className="text-[12.5px] font-semibold">kg</span>
              <span className="ml-auto text-[12px] font-semibold" style={{ color: 'var(--sc-red)' }}>
                2주 −8%
              </span>
            </p>
            <Spark kind="down" width={200} height={34} delay={0.35} />
          </div>

          <div className="sc-alert sc-pop mt-2.5" style={{ '--d': '1.3s' } as React.CSSProperties}>
            <span className="sc-alert-dot" aria-hidden="true" />
            <span>
              <b className="font-semibold">검진 받아 볼 때예요</b> — 행동 변화 알림
            </span>
          </div>
          <p className="m-0 mt-2 text-center text-[10.5px]" style={{ color: 'var(--sc-muted)' }}>
            진단이 아닙니다 · 평소와 비교한 기록
          </p>
          <div className="mt-2 flex justify-around pt-2 text-[11px] font-semibold" style={{ borderTop: '1px solid var(--sc-line)', color: 'var(--sc-muted)' }} aria-hidden="true">
            <span style={{ color: 'var(--sc-teal)' }}>오늘</span>
            <span>기록</span>
            <span>리포트</span>
          </div>
        </div>
        <figcaption id="sc-phone-cap" className="sr-only">
          예시 화면 · 시뮬레이션 수치. 보호자 앱 홈: 보리(13살), 오늘 소변 5회(평소 3회), 체중 3.31kg으로 2주 사이 8% 줄어듦, 알림 &ldquo;검진 받아 볼 때예요 —
          행동 변화 알림&rdquo;. 실제 앱·실측 값이 아닙니다.
        </figcaption>
      </figure>
    </MotionScope>
  );
}
