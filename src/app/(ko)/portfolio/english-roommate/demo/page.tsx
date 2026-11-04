import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { OG_IMAGES, TWITTER_IMAGES } from '@/components/seo/ogMeta';
import RoommateDemo from '@/features/roommate/RoommateDemo';
import { DeviceFace } from '@/features/roommate/story/Scene';
import { storyFontVars } from '@/features/roommate/story/fonts';
import s from '@/features/roommate/story/story.module.css';

// 가상 기기 데모. 페이지 껍데기는 정적이고, 기기·대화·기억은 전부 브라우저(RoommateDemo)에서 돈다.
// 마이크(음성 인식)를 쓰려면 이 경로만 Permissions-Policy의 microphone을 열어야 한다(next.config.ts).

const URL = `${SITE_URL}/portfolio/english-roommate/demo`;
const TITLE = '가상 기기 데모 — 먼저 말 거는 영어 룸메이트 | 여준수';
const DESCRIPTION = '센서를 켜면 기기가 먼저 영어로 말을 걸고, 틀린 표현을 기억했다가 다음 날 다시 묻는 웹 데모.';

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

export default function EnglishRoommateDemoPage(): JSX.Element {
  return (
    <main className={`${s.root} ${s.band} ${s.morning} ${storyFontVars}`}>
      <div className={`${s.wrap} pt-12 sm:pt-16 pb-20`} style={{ maxWidth: 1060 }}>
        <Link href="/portfolio/english-roommate" className={`${s.back} mb-8`}>
          <span aria-hidden="true">←</span> 먼저 말 거는 영어 룸메이트 — 하루 이야기로 돌아가기
        </Link>

        <header className="mb-10 grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
          <DeviceFace className="w-14 h-14 sm:w-20 sm:h-20" />
          <div className="min-w-0">
            <p className={`${s.mono} m-0 mb-2`}>웹 데모 · 아침부터 밤까지 시간대를 골라 보세요</p>
            <h1 className={s.h1} style={{ marginBottom: 12 }}>
              가상 기기
            </h1>
            <p className={s.body} style={{ maxWidth: '62ch', fontSize: 16.5 }}>
              실제 기기의 센서를 토글로 대신합니다. <b>사람 감지</b>와 <b>폰 근접</b>이 켜지면 기기가 먼저 말을 겁니다. 마이크는 &ldquo;말하기&rdquo;를
              누른 동안만 켜지고, 마이크가 없거나 브라우저가 음성 인식을 지원하지 않으면 글로 대답하면 됩니다.
            </p>
          </div>
        </header>

        <RoommateDemo />

        <p className={`${s.footnote} mt-14`} style={{ fontSize: 13.5 }}>
          음성 인식·읽기는 브라우저의 Web Speech API를 씁니다(크롬은 음성 인식을 위해 소리를 구글 서버로 보낼 수 있습니다). 대화와 기억은 서버에
          저장하지 않고 이 브라우저에만 남습니다. LLM 모드일 때만 입력한 문장이 답을 만들기 위해 서버를 거쳐 LLM API로 갑니다.
        </p>
      </div>
    </main>
  );
}
