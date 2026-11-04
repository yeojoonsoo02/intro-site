import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { OG_IMAGES, TWITTER_IMAGES } from '@/components/seo/ogMeta';
import RadarDemo from '@/features/lonelyradar/RadarDemo';
import '@/features/lonelyradar/editorial.css';

// 생활 리듬 레이더 데모. 페이지 껍데기는 정적이고, 시뮬레이터·알고리즘은 전부 브라우저(RadarDemo)에서 돈다.
// 설명 페이지와 같은 "조용한 에디토리얼" 지면(editorial.css의 .lr 토큰)을 쓴다 — 데모 차트·버튼은 토큰만 쓰므로 그대로 따라온다.

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
    <main className="lr">
      <div className="lr-wrap" style={{ paddingTop: 20, paddingBottom: 88 }}>
        <Link
          href="/portfolio/lonely-radar"
          className="inline-flex items-center gap-1 text-[14px] underline-offset-4 hover:underline"
          style={{ color: 'var(--muted)', padding: '6px 0' }}
        >
          <span aria-hidden="true">←</span> 1인가구 생활 리듬 레이더
        </Link>

        <header className="lr-demo-head">
          <div>
            <p className="lr-demo-kicker">웹 데모 · 시뮬레이션 데이터</p>
            <h1 className="lr-demo-title">생활 리듬 레이더 시뮬레이터</h1>
          </div>
          <div>
            <p className="lr-p" style={{ fontSize: 16.5, lineHeight: 1.75, color: 'var(--ink-2)' }}>
              실제 레이더 대신 시뮬레이터가 한 사람의 42일을 1분 단위로 만듭니다. 알고리즘은 레이더 키트가 줄 법한 값(재실·움직임 세기·호흡수·쓰러짐 표시)만
              보고 상태를 정하고, 처음 2주로 그 사람의 평소를 만든 뒤, 벗어나면 본인 → 관리자 → 연락처 순으로 알립니다. 결과는 미리 적어 둔 값이 아니라 매번
              계산한 값입니다.
            </p>
          </div>
        </header>

        <RadarDemo />

        <p className="lr-small" style={{ marginTop: 56, paddingTop: 18, borderTop: '1px solid var(--rule)', maxWidth: '70ch' }}>
          모든 계산은 이 브라우저에서만 합니다. 서버로 보내는 데이터는 없고, 고른 시나리오 같은 설정만 이 브라우저에 기억합니다. 생활 일과·검출 확률·응답 확률은
          데모용 가정이며 실제 사람 데이터가 아닙니다. 이 데모는 사망을 감지하지 않습니다.
        </p>
      </div>
    </main>
  );
}
