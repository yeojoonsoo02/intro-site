import Image from 'next/image';
import { MotionScope } from '@/features/capstone/motion';
import { AiImageChip } from '@/features/capstone/CapstoneHero';

// 첫 화면 그림: 원룸 책상 위 기기의 LED 링이 켜지고, 기기가 먼저 건 말이 말풍선으로 올라온다.
// 말풍선 문장은 본문 "하루 예시" 07:30 장면(어제 틀린 표현으로 인사)을 옮긴 것이다.

export default function RoommateHeroVisual(): JSX.Element {
  return (
    <figure className="m-0">
      <MotionScope className="cap-photo">
        <Image
          src="/portfolio/capstone/roommate-hero.webp"
          width={1024}
          height={768}
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          alt="아침빛이 드는 작은 원룸. 책상 위 둥근 기기의 윗면 링이 주황빛으로 켜져 있고, 뒤로 정리 안 된 침대와 의자에 걸린 후드티가 보인다."
        />
        <span aria-hidden="true" className="cap-led" style={{ left: '44.6%', top: '57%' }} />
        <p className="cap-bubble m-0" style={{ left: '7%', top: '9%' }}>
          <span className="block mb-1 text-[11.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
            07:30 · 기기가 먼저
          </span>
          <span lang="en">Good morning! Ready to try &ldquo;I&rsquo;m running late&rdquo; today?</span>
        </p>
        <AiImageChip />
      </MotionScope>
      <figcaption className="mt-2 text-[13px] leading-[1.5]" style={{ color: 'var(--muted)' }}>
        방에 있는 걸 알아채면 기기가 먼저 말을 건다. 어제 틀린 표현으로.
      </figcaption>
    </figure>
  );
}
