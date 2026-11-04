import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { OG_IMAGES, TWITTER_IMAGES } from '@/components/seo/ogMeta';
import '@/features/aicheck/lab.css';
import AiCheckDemo from '@/features/aicheck/AiCheckDemo';

// "이거 AI야?" 웹 데모. 페이지 껍데기는 정적이고, 판독·판별·압축은 전부 브라우저(AiCheckDemo)에서 돈다.
// 서버 키도 서버 API도 쓰지 않는다. 바깥에서 받는 건 판독기 Wasm(jsDelivr)과 모델 파일(Hugging Face)뿐이다.
// 설명 페이지와 같은 검사 콘솔 모양(lab.css) — 단계마다 사건 번호를 단 카드.

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
    <main className="lab">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-12 sm:pt-14 pb-16">
        <Link href="/portfolio/ai-check" className="lab-mono inline-flex items-center gap-1 text-[13px] mb-7 hover:underline underline-offset-4" style={{ color: 'var(--muted)' }}>
          <span aria-hidden="true">←</span> 이거 AI야? 감식 보고서
        </Link>

        <header className="mb-8 max-w-[760px]">
          <p className="lab-kicker flex flex-wrap gap-x-3 gap-y-1 m-0 mb-4">
            <span>CASE AIC-2026-11</span>
            <span aria-hidden="true">/</span>
            <span>웹 데모 · 이미지</span>
            <span style={{ color: 'var(--accent)' }}>● 브라우저 안에서 판별</span>
          </p>
          <h1 className="m-0 mb-4 text-[34px] sm:text-[44px] font-extrabold leading-[1.1] tracking-[-0.03em]" style={{ color: 'var(--ink)' }}>
            이 이미지, AI야?
          </h1>
          <p className="m-0 text-[16.5px] leading-[1.7] max-w-[62ch]" style={{ color: 'var(--ink-2)' }}>
            파일 안의 <b style={{ color: 'var(--ink)' }}>AI 표시</b>를 먼저 확인하고, 없으면 <b style={{ color: 'var(--ink)' }}>판별 모델</b>이 그림 자체를
            봅니다. 결과는 &ldquo;AI 표시 확인됨 · AI 의심 N% · 판단 어려움&rdquo; 셋 중 하나로만 말합니다. 아래 압축 실험에서 SNS에 올린 것처럼 줄여 보면, 이
            문제가 왜 어려운지 바로 보입니다.
          </p>
        </header>

        <AiCheckDemo />

        <p className="mt-12 pt-5 text-[13.5px] leading-[1.65] max-w-[72ch]" style={{ color: 'var(--muted)', borderTop: '1px solid var(--rule)' }}>
          판독·판별·압축은 모두 이 브라우저 안에서 합니다. 서버로 보내는 데이터는 없습니다. C2PA 판독기는 Content Authenticity Initiative의
          c2pa-web(MIT), 판별 모델은 Community Forensics ViT-S(Park &amp; Owens, CVPR 2025, MIT)입니다. 이 데모의 결과는 연구용 시제품의 출력이며
          사실 확인이나 법적 판단의 근거가 아닙니다.
        </p>
        <p className="mt-5 lab-mono text-[14px]">
          <Link href="/portfolio/ai-check" className="link-u">
            ← 감식 보고서로 돌아가기
          </Link>
        </p>
      </div>
    </main>
  );
}
