import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { OG_IMAGES, TWITTER_IMAGES } from '@/components/seo/ogMeta';
import AiCheckDemo from '@/features/aicheck/AiCheckDemo';

// "이거 AI야?" 웹 데모. 페이지 껍데기는 정적이고, 판독·판별·압축은 전부 브라우저(AiCheckDemo)에서 돈다.
// 서버 키도 서버 API도 쓰지 않는다. 바깥에서 받는 건 판독기 Wasm(jsDelivr)과 모델 파일(Hugging Face)뿐이다.

const URL = `${SITE_URL}/portfolio/ai-check/demo`;
const TITLE = '웹 데모 — 이거 AI야? SNS 압축에도 버티는 AI 이미지 판별기 | 여준수';
const DESCRIPTION = '이미지를 넣으면 브라우저 안에서 C2PA·IPTC AI 표시를 확인하고, 오픈소스 판별 모델로 점수를 매기고, SNS처럼 압축하면 무엇이 사라지는지 보여 주는 웹 데모.';

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

export default function AiCheckDemoPage(): JSX.Element {
  return (
    <main style={{ background: 'var(--paper)' }}>
      <div className="max-w-[1000px] mx-auto px-5 sm:px-6 pt-14 sm:pt-20 pb-20">
        <Link
          href="/portfolio/ai-check"
          className="inline-flex items-center gap-1 text-[14px] mb-10 underline-offset-4 hover:underline"
          style={{ color: 'var(--muted)' }}
        >
          <span aria-hidden="true">←</span> 이거 AI야?
        </Link>

        <header className="mb-10 max-w-[720px]">
          <p className="text-[12.5px] tracking-[.03em] mb-4" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
            웹 데모 · 이미지
          </p>
          <h1
            className="text-[30px] sm:text-[36px] font-bold leading-[1.2] mb-4"
            style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)', textWrap: 'balance' }}
          >
            이 이미지, AI야?
          </h1>
          <p className="text-[17px] leading-[1.7] max-w-[60ch]" style={{ color: 'var(--ink-2)' }}>
            파일 안의 <b>AI 표시</b>를 먼저 확인하고, 없으면 <b>판별 모델</b>이 그림 자체를 봅니다. 결과는 &ldquo;AI 표시 확인됨 · AI 의심 N% · 판단
            어려움&rdquo; 셋 중 하나로만 말합니다. 아래 압축 실험에서 SNS에 올린 것처럼 줄여 보면, 이 문제가 왜 어려운지 바로 보입니다.
          </p>
        </header>

        <AiCheckDemo />

        <p className="mt-14 text-[13.5px] leading-[1.65] max-w-[70ch]" style={{ color: 'var(--muted)' }}>
          판독·판별·압축은 모두 이 브라우저 안에서 합니다. 서버로 보내는 데이터는 없습니다. C2PA 판독기는 Content Authenticity Initiative의
          c2pa-web(MIT), 판별 모델은 Community Forensics ViT-S(Park &amp; Owens, CVPR 2025, MIT)입니다. 이 데모의 결과는 연구용 시제품의 출력이며
          사실 확인이나 법적 판단의 근거가 아닙니다.
        </p>
      </div>
    </main>
  );
}
