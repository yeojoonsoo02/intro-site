import Image from 'next/image';
import { MotionScope } from '@/features/capstone/motion';
import { AiImageChip } from '@/features/capstone/CapstoneHero';

// 첫 화면 그림: 해 질 녘 원룸 벽 위 센서에서 레이더 전파가 퍼진다(화면에 들어올 때 두 번, 동작 줄이기면 멈춘 고리 하나).

export default function LonelyRadarHeroVisual(): JSX.Element {
  return (
    <figure className="m-0">
      <MotionScope className="cap-photo">
        <Image
          src="/portfolio/capstone/lonelyradar-hero.webp"
          width={1024}
          height={768}
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          alt="해 질 녘 불 꺼진 원룸을 문간에서 본 모습. 창밖은 푸르고, 침대 옆 스탠드 하나가 켜져 있으며, 벽 높은 곳에 작은 흰 센서가 붙어 있다."
        />
        <div aria-hidden="true" className="absolute inset-0">
          <span className="cap-wave" style={{ left: '73.4%', top: '21.5%' }} />
          <span className="cap-wave" style={{ left: '73.4%', top: '21.5%' }} />
          <span className="cap-wave" style={{ left: '73.4%', top: '21.5%' }} />
          <span className="cap-sensor-dot" style={{ left: '73.4%', top: '21.5%' }} />
        </div>
        <span className="cap-chip" style={{ left: '50%', top: '33%' }}>
          카메라 없음 · 움직임과 호흡만
        </span>
        <AiImageChip />
      </MotionScope>
      <figcaption className="mt-2 text-[13px] leading-[1.5]" style={{ color: 'var(--muted)' }}>
        영상·소리를 만들지 않는 레이더가 평소 생활 리듬을 배우고, 벗어나면 본인에게 먼저 묻는다.
      </figcaption>
    </figure>
  );
}
