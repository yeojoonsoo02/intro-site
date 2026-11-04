import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { OG_IMAGES, TWITTER_IMAGES } from '@/components/seo/ogMeta';
import RadarDemo from '@/features/lonelyradar/RadarDemo';

// 생활 리듬 레이더 데모. 페이지 껍데기는 정적이고, 시뮬레이터·알고리즘은 전부 브라우저(RadarDemo)에서 돈다.

const URL = `${SITE_URL}/portfolio/lonely-radar/demo`;
const TITLE = '시뮬레이터 데모 — 1인가구 생활 리듬 레이더 | 여준수';
const DESCRIPTION =
  '혼자 사는 사람의 하루를 레이더 1분 값으로 시뮬레이션하고, 상태 머신·개인 기준선·이탈 규칙·단계 알림·헛경보 미터를 브라우저에서 계산하는 웹 데모.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: '여준수 자기소개',
    locale: 'ko_KR',
    type: 'website',
    images: OG_IMAGES,
  },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION, images: TWITTER_IMAGES },
};

export default function LonelyRadarDemoPage(): JSX.Element {
  return (
    <main style={{ background: 'var(--paper)' }}>
      <div className="max-w-[1080px] mx-auto px-5 sm:px-6 pt-14 sm:pt-20 pb-20">
        <Link
          href="/portfolio/lonely-radar"
          className="inline-flex items-center gap-1 text-[14px] mb-10 underline-offset-4 hover:underline"
          style={{ color: 'var(--muted)' }}
        >
          <span aria-hidden="true">←</span> 1인가구 생활 리듬 레이더
        </Link>

        <header className="mb-10 max-w-[720px]">
          <p className="text-[12.5px] tracking-[.03em] mb-4" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
            웹 데모 · 시뮬레이션 데이터
          </p>
          <h1
            className="text-[30px] sm:text-[36px] font-bold leading-[1.2] mb-4"
            style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)', textWrap: 'balance' }}
          >
            생활 리듬 레이더 시뮬레이터
          </h1>
          <p className="text-[17px] leading-[1.7] max-w-[60ch]" style={{ color: 'var(--ink-2)' }}>
            실제 레이더 대신 시뮬레이터가 한 사람의 42일을 1분 단위로 만듭니다. 알고리즘은 레이더 키트가 줄 법한 값(재실·움직임 세기·호흡수·쓰러짐 표시)만 보고
            상태를 정하고, 처음 2주로 그 사람의 평소를 만든 뒤, 벗어나면 본인 → 관리자 → 연락처 순으로 알립니다. 결과는 미리 적어 둔 값이 아니라 매번 계산한
            값입니다.
          </p>
        </header>

        <RadarDemo />

        <p className="mt-14 text-[13.5px] leading-[1.65] max-w-[70ch]" style={{ color: 'var(--muted)' }}>
          모든 계산은 이 브라우저에서만 합니다. 서버로 보내는 데이터는 없고, 고른 시나리오 같은 설정만 이 브라우저에 기억합니다. 생활 일과·검출 확률·응답
          확률은 데모용 가정이며 실제 사람 데이터가 아닙니다. 이 데모는 사망을 감지하지 않습니다.
        </p>
      </div>
    </main>
  );
}
