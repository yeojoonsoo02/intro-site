import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { OG_IMAGES, TWITTER_IMAGES } from '@/components/seo/ogMeta';
import '@/features/capstone/capstone.css';
import CatDemo from '@/features/seniorcat/CatDemo';

// 화장실 무게 센서 데모. 페이지 껍데기는 정적이고, 시뮬레이터·알고리즘은 전부 브라우저(CatDemo)에서 돈다.

const URL = `${SITE_URL}/portfolio/senior-cat/demo`;
const TITLE = '시뮬레이터 데모 — 노령묘 화장실 무게 센서 | 여준수';
const DESCRIPTION = '고양이 화장실 무게 신호를 시뮬레이션하고, 방문 검출·체중으로 고양이 구분·고양이별 기준선·행동 변화 알림·병원 리포트까지 브라우저에서 계산하는 웹 데모.';

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

export default function SeniorCatDemoPage(): JSX.Element {
  return (
    <main className="cap cap-seniorcat" style={{ background: 'var(--paper)' }}>
      <div className="max-w-[1080px] mx-auto px-5 sm:px-6 pt-14 sm:pt-20 pb-20">
        <Link
          href="/portfolio/senior-cat"
          className="inline-flex items-center gap-1 text-[14px] mb-10 underline-offset-4 hover:underline cat-report-noprint"
          style={{ color: 'var(--muted)' }}
        >
          <span aria-hidden="true">←</span> 노령묘 화장실 무게 센서
        </Link>

        <header className="mb-10 max-w-[720px] cat-report-noprint">
          <p className="text-[12.5px] tracking-[.03em] mb-4" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
            웹 데모 · 시뮬레이션 데이터
          </p>
          <h1
            className="text-[30px] sm:text-[36px] font-bold leading-[1.2] mb-4"
            style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)', textWrap: 'balance' }}
          >
            화장실 저울 시뮬레이터
          </h1>
          <p className="text-[17px] leading-[1.7] max-w-[60ch]" style={{ color: 'var(--ink-2)' }}>
            실제 저울 대신 시뮬레이터가 무게 신호를 만듭니다. 알고리즘은 그 신호만 보고 방문을 찾고, 체중으로 고양이를 가리고, 고양이마다 평소 기준선을
            만들어 벗어나면 알립니다. 결과는 미리 적어 둔 값이 아니라 매번 계산한 값입니다.
          </p>
        </header>

        <CatDemo />

        <p className="mt-14 text-[13.5px] leading-[1.65] max-w-[70ch] cat-report-noprint" style={{ color: 'var(--muted)' }}>
          모든 계산은 이 브라우저에서만 합니다. 서버로 보내는 데이터는 없고, 시나리오·기준선 기간 같은 설정만 이 브라우저에 기억합니다. 시뮬레이터의 소변
          횟수·양·머문 시간은 데모용 가정이며 실제 고양이 데이터가 아닙니다. 알림은 진단이 아니라 행동 변화 알림입니다.
        </p>
      </div>
    </main>
  );
}
