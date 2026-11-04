import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { OG_IMAGES, TWITTER_IMAGES } from '@/components/seo/ogMeta';
import Scene, { DeviceFace } from '@/features/roommate/story/Scene';
import Appendix from '@/features/roommate/story/Appendix';
import { SCENES } from '@/features/roommate/story/content';
import { storyFontVars } from '@/features/roommate/story/fonts';
import s from '@/features/roommate/story/story.module.css';

// 졸업작품 구상 "먼저 말 거는 영어 룸메이트" 설명 페이지. 한국어만 있다(포트폴리오 상세와 같다).
// 형식은 "하루를 따라가는 스토리": 새벽(첫 화면) → 07:30 → 12:00 → 언제든 → 19:00 → 22:00 → 밤 이후(접힌 부록) → 다음 날 아침(데모).
// 데이터 없이 코드에 쓴 정적 페이지라 빌드 때 만들어 둔다. /portfolio/[id]보다 이 정적 경로가 먼저 잡힌다.

const URL = `${SITE_URL}/portfolio/english-roommate`;
const TITLE = '먼저 말 거는 영어 룸메이트 — 포트폴리오 | 여준수';
const DESCRIPTION = '앱은 내가 열어야 시작되고, 이 기기는 내가 방에 있으면 먼저 시작한다. 혼자 사는 20~30대를 위한 영어 말하기 기기 구상과 웹 데모.';

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
    type: 'article',
    images: OG_IMAGES,
  },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION, images: TWITTER_IMAGES },
};

const DEMO = '/portfolio/english-roommate/demo';

export default function EnglishRoommatePage(): JSX.Element {
  return (
    <main className={`${s.root} ${storyFontVars}`}>
      {/* 새벽: 하루가 시작되기 전 */}
      <header className={`${s.band} ${s.cover}`}>
        <div className={s.wrap}>
          <Link href="/portfolio" className={s.back}>
            <span aria-hidden="true">←</span> 전체 프로젝트 보기
          </Link>
          <div className={s.coverGrid}>
            <div className="min-w-0">
              <p className={`${s.eyebrow} ${s.mono}`}>
                <span>졸업작품 구상</span>
                <span className={s.status}>
                  <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--acc)' }} />
                  구상 · 웹 데모
                </span>
              </p>
              <h1 className={s.h1}>먼저 말 거는 영어 룸메이트</h1>
              <p className={s.concept}>앱은 내가 열어야 시작되고, 이 기기는 내가 방에 있으면 먼저 시작한다.</p>
              <div className={s.actions}>
                <Link href={DEMO} className={`btn btn-primary ${s.btnRound}`}>
                  가상 기기 데모 열기 <span aria-hidden="true">→</span>
                </Link>
                <a href="#research" className={`btn btn-ghost ${s.btnRound}`}>
                  연구 질문 보기
                </a>
              </div>
            </div>
            <dl className={s.glance} aria-label="한눈에">
              <dt>대상</dt>
              <dd>혼자 사는 20~30대 영어 학습자</dd>
              <dt>형태</dt>
              <dd>방에 두는 작은 기기 + 폰 웹앱 (같은 엔진)</dd>
              <dt>핵심 기술</dt>
              <dd>먼저 말 걸기(근접·레이더) · 틀린 표현 간격 반복</dd>
              <dt>지금</dt>
              <dd>웹 가상 기기 데모 (2026-11)</dd>
            </dl>
          </div>

          <p className={`${s.hint} ${s.mono}`}>
            <DeviceFace className="w-6 h-6" />
            <span>
              <b>07:30 → 22:00</b> · 아래로 내려가면 이 기기와 보내는 하루가 아침에서 밤이 됩니다
            </span>
          </p>
        </div>
      </header>

      {SCENES.map((sc) => (
        <Scene key={sc.id} scene={sc} />
      ))}

      <Appendix />

      {/* 다음 날 아침: 직접 켜 보기 */}
      <section aria-labelledby="try-h" className={`${s.band} ${s.morning} ${s.ending}`}>
        <div className={s.wrap}>
          <div className={s.endingGrid}>
            <DeviceFace className="w-16 h-16" />
            <div className="grid gap-3">
              <p className={`${s.mono} m-0`}>다음 날 아침</p>
              <h2 id="try-h" className={s.h1} style={{ fontSize: 'clamp(26px, 3.4vw, 34px)', marginBottom: 0 }}>
                가상 기기로 해 보기
              </h2>
              <p className={s.body} style={{ maxWidth: '60ch' }}>
                레이더·폰 근접·시간대를 켜고 끄면 기기가 먼저 말을 겁니다. 틀린 표현은 기억에 쌓이고 다음 날 다시 묻습니다. 마이크가 없으면 글로
                대답해도 됩니다.
              </p>
              <div>
                <Link href={DEMO} className={`btn btn-primary ${s.btnRound}`}>
                  데모 열기 <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>

          <footer className={s.footer}>
            <Link href="/portfolio" className="link-u">
              ← 포트폴리오
            </Link>
            <Link href={DEMO} className="link-u">
              데모 →
            </Link>
          </footer>
          <p className={s.footnote}>
            이 페이지의 사진은 실제 촬영이 아니라, 이 작업용 맥에서 오픈소스 모델(FLUX.2 klein 4B, Apache-2.0)로 만든 AI 이미지입니다. 사람·실제 제품은
            나오지 않습니다.
          </p>
        </div>
      </section>
    </main>
  );
}
