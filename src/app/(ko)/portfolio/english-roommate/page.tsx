import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { OG_IMAGES, TWITTER_IMAGES } from '@/components/seo/ogMeta';
import SystemDiagram from '@/features/roommate/SystemDiagram';

// 졸업작품 구상 "먼저 말 거는 영어 룸메이트" 설명 페이지. 한국어만 있다(포트폴리오 상세와 같다).
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

const COMPARE: { what: string; app: string; device: string }[] = [
  { what: '누가 시작', app: '내가 앱을 열어야 시작', device: '정해 둔 시간에 내가 방에 있으면 기기가 먼저 말을 건다' },
  { what: '어디서', app: '폰을 들고 화면을 본다', device: '방 안에서 손 안 쓰고 말로' },
  { what: '듣기 입력', app: '모두에게 같은 교재', device: '내 관심사·수준·지난 실수로 만든 짧은 영어 브리핑' },
  { what: '기억', app: '틀린 표현이 그날로 끝', device: '며칠 뒤 틀린 표현을 다시 묻는다(간격 반복)' },
  { what: '방해', app: '알림·다른 앱이 옆에 있다', device: '영어만 하는 기기라 딴 길이 없다' },
  { what: '타이밍', app: '알림이 아무 때나 온다', device: '방에 있고 바쁘지 않을 때만 말한다' },
];

const DAY: { time: string; scene: string; detail: string }[] = [
  { time: '07:30', scene: '방에 있음을 감지 → 인사', detail: '어제 틀린 "I\'m running late"를 넣어 인사하고 한 번 말해 보게 한다.' },
  { time: '12:00', scene: '2분 쉬운 영어 브리핑', detail: '관심사 하나를 쉬운 영어로 들려준다.' },
  { time: '19:00', scene: '"How was your day?"', detail: '3분 대화. 틀린 표현을 기록한다.' },
  { time: '22:00', scene: '1분 복습 퀴즈', detail: '오늘 틀린 표현 3개를 다시 묻는다.' },
  { time: '언제든', scene: '"나중에" 버튼', detail: '미루면 조용해지고, 언제 말 걸어야 하는지를 배운다.' },
];

const HARDWARE: { part: string; why: string }[] = [
  { part: '사람 감지 센서', why: 'mmWave 레이더 또는 PIR. 방에 실제로 있는지 본다.' },
  { part: '버튼 2개 + 마이크 LED', why: '"말하기"·"나중에". 항상 듣지 않는다 — 마이크는 버튼을 누르거나 기기가 물어본 뒤에만 켜지고, 켜진 동안 LED가 켜진다.' },
  { part: '마이크 · 스피커', why: '말로만 주고받는다.' },
  { part: 'ESP32-S3 (또는 STM32WB)', why: '센서·버튼·LED·오디오 전송과 BLE 비콘. 무거운 일은 서버가 해서 기기는 얇게 둔다.' },
];

const RISKS: { risk: string; answer: string }[] = [
  { risk: '귀찮음', answer: '하루 말 거는 횟수 상한, "나중에" 버튼, 거절한 시간대는 덜 말 걸기.' },
  { risk: '사생활', answer: '항상 듣지 않음, 마이크 LED, 녹음은 동의한 경우에만 저장.' },
  { risk: '참가자당 기기 값', answer: 'ESP32-S3 얇은 클라이언트로 부품을 줄인다. 폰 웹앱 모드도 같은 엔진이라 기기 없이도 실험할 수 있다.' },
  { risk: '음성 처리 비용', answer: '받아쓰기·음성 합성은 기기나 브라우저에서 할 수 있는 만큼 하고, LLM만 API로 보낸다.' },
];

const ROADMAP: { step: string; detail: string; now?: boolean }[] = [
  { step: '웹 가상 기기 데모', detail: '센서 토글·먼저 말 걸기·기억과 복습. 이 페이지의 데모.', now: true },
  { step: '폰 웹앱 + 기억 서버', detail: '복습 일정을 서버로 옮기고, 실제 하루 일정으로 말을 건다.' },
  { step: '기기 시제품', detail: 'ESP32-S3에 레이더·버튼·LED·마이크·스피커를 붙인다.' },
  { step: '폰 근접 시험', detail: 'BLE 비콘 감지 지연과 iOS 위치 권한을 실제로 확인한다.' },
  { step: '교차 실험', detail: '20~30명, 앱 모드 2주 · 기기 모드 2주.' },
  { step: '교실·기관판', detail: '여러 학습자를 한 기관이 관리하는 확장판(이후).' },
];

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }): JSX.Element {
  return (
    <h2
      id={`${id}-title`}
      className="text-[22px] sm:text-[24px] font-semibold leading-tight mb-5"
      style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)' }}
    >
      {children}
    </h2>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }): JSX.Element {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <SectionTitle id={id}>{title}</SectionTitle>
      {children}
    </section>
  );
}

const P = 'text-[17px] leading-[1.75] max-w-[62ch]';
const LABEL = 'text-[12.5px] tracking-[.03em]';

export default function EnglishRoommatePage(): JSX.Element {
  return (
    <main style={{ background: 'var(--paper)' }}>
      <article className="max-w-[720px] mx-auto px-5 sm:px-6 pt-14 sm:pt-20 pb-20">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1 text-[14px] mb-10 underline-offset-4 hover:underline"
          style={{ color: 'var(--muted)' }}
        >
          <span aria-hidden="true">←</span> 전체 프로젝트 보기
        </Link>

        <header className="mb-14">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4">
            <span className={LABEL} style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              졸업작품 구상
            </span>
            <span className={`inline-flex items-center gap-1.5 ${LABEL}`} style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--muted)' }} />
              구상 · 웹 데모
            </span>
          </div>
          <h1
            className="text-[32px] sm:text-[40px] font-bold leading-[1.2] mb-6"
            style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)', textWrap: 'balance' }}
          >
            먼저 말 거는 영어 룸메이트
          </h1>
          <p className="intro-p text-[19px] leading-[1.7] max-w-[56ch] mb-8" style={{ color: 'var(--ink)' }}>
            앱은 내가 열어야 시작되고, 이 기기는 내가 방에 있으면 먼저 시작한다.
          </p>

          <dl
            className="m-0 grid gap-x-8 gap-y-3 sm:grid-cols-[auto_1fr] py-5 text-[15px]"
            style={{ borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}
          >
            <Row label="대상">혼자 사는 20~30대 영어 학습자</Row>
            <Row label="형태">방에 두는 작은 기기 + 폰 웹앱 (같은 엔진)</Row>
            <Row label="핵심 기술">먼저 말 걸기(근접·레이더) · 틀린 표현 간격 반복</Row>
            <Row label="지금">웹 가상 기기 데모 (2026-11)</Row>
          </dl>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/portfolio/english-roommate/demo" className="btn btn-primary">
              가상 기기 데모 열기 <span aria-hidden="true">→</span>
            </Link>
            <a href="#research" className="btn btn-ghost">
              연구 질문 보기
            </a>
          </div>
        </header>

        <div className="grid gap-14 sm:gap-16">
          <Section id="problem" title="대상과 문제">
            <div className="grid gap-4">
              <p className={P} style={{ color: 'var(--ink)' }}>
                언어 앱이 실패하는 건 기능이 모자라서라기보다, 사람이 앱을 더 이상 열지 않아서라고 본다. 이 프로젝트의 출발 가설이다. 그래서 기능을
                더하는 대신 &ldquo;누가 먼저 시작하나&rdquo;를 바꾼다.
              </p>
              <p className={P} style={{ color: 'var(--ink)' }}>
                대상은 <b>혼자 사는 20~30대 영어 학습자</b>다. 집에서 영어로 말 걸어 줄 사람이 없다. 1인 가구는 전체 가구의 약 35%다(2023, 기사
                인용). 학원·학교처럼 여러 학습자를 관리하는 교실판은 이후 확장으로 둔다.
              </p>
            </div>
          </Section>

          <Section id="compare" title="폰 앱과 다른 점">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[15px] leading-[1.6]">
                <caption className="sr-only">폰 영어 앱과 이 기기의 비교</caption>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--ink-2)' }}>
                    <th scope="col" className={`text-left font-normal py-2 pr-3 w-[22%] ${LABEL}`} style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                      항목
                    </th>
                    <th scope="col" className={`text-left font-normal py-2 pr-3 w-[33%] ${LABEL}`} style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                      폰 앱
                    </th>
                    <th scope="col" className={`text-left font-normal py-2 ${LABEL}`} style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                      이 기기
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((r) => (
                    <tr key={r.what} style={{ borderBottom: '1px solid var(--rule)' }}>
                      <th scope="row" className="text-left align-top py-3 pr-3 font-semibold" style={{ color: 'var(--ink)' }}>
                        {r.what}
                      </th>
                      <td className="align-top py-3 pr-3" style={{ color: 'var(--muted)' }}>
                        {r.app}
                      </td>
                      <td className="align-top py-3" style={{ color: 'var(--ink)' }}>
                        {r.device}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[15px] leading-[1.7] max-w-[62ch]" style={{ color: 'var(--ink-2)' }}>
              핵심 기술은 <b>기억</b>이다. 대화에서 틀린 표현을 모아 두고, 며칠 간격을 늘려 가며 기기가 먼저 다시 묻는다.
            </p>
          </Section>

          <Section id="day" title="하루 예시">
            <ol className="list-none m-0 p-0 grid gap-0" style={{ borderTop: '1px solid var(--rule)' }}>
              {DAY.map((d) => (
                <li key={d.time} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 py-4" style={{ borderBottom: '1px solid var(--rule)' }}>
                  <span className="text-[14px] pt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                    {d.time}
                  </span>
                  <div>
                    <p className="text-[17px] font-semibold" style={{ color: 'var(--ink)' }}>
                      {d.scene}
                    </p>
                    <p className="text-[15.5px] leading-[1.65]" style={{ color: 'var(--ink-2)' }}>
                      {d.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="system" title="시스템 구성">
            <SystemDiagram />
            <div className="grid gap-5 mt-8">
              <Decision what="LLM은 클라우드 API로 (확정)">
                받아쓰기·음성 합성은 기기나 브라우저에서 할 수 있는 만큼 하고, 대화 문장만 API로 보낸다. Claude Haiku 5.5(100만 토큰당 입력 $0.10 ·
                출력 $0.50) 기준으로 한 달 3시간쯤 쓰는 학생 한 명에 약 200원이다(추정).
              </Decision>
              <Decision what="기기 안 LLM은 쓰지 않는다">
                전부 기기 안에서 돌리는 방식은 대화 품질이 모자라 뺐다. 로컬 통화 연습 시제품(받아쓰기 → gemma4 → Kokoro 음성, 맥에서 평균 1.1초, 합성 음성으로 잰 값)으로
                음성 파이프라인 자체는 확인했다.
              </Decision>
              <Decision what="개인 ChatGPT·Claude 구독은 끌어 쓰지 않는다">
                구독 계정의 토큰을 뽑아 쓰는 방식은 약관 위반이라 하지 않는다.
              </Decision>
              <Decision what="기기에 묶이지 않는다">
                폰 웹앱·노트북·전용 기기가 같은 엔진을 쓴다. 실험에서 &ldquo;앱 모드&rdquo;와 &ldquo;기기 모드&rdquo;를 같은 대화 품질로 비교할 수
                있다.
              </Decision>
            </div>
          </Section>

          <Section id="hardware" title="하드웨어">
            <dl className="m-0 grid gap-4">
              {HARDWARE.map((h) => (
                <div key={h.part} className="pl-4" style={{ borderLeft: '1px solid var(--rule)' }}>
                  <dt className="text-[17px] font-semibold" style={{ color: 'var(--ink)' }}>
                    {h.part}
                  </dt>
                  <dd className="m-0 text-[15.5px] leading-[1.7]" style={{ color: 'var(--ink-2)' }}>
                    {h.why}
                  </dd>
                </div>
              ))}
            </dl>

            <h3 className="mt-10 mb-3 text-[18px] font-semibold" style={{ color: 'var(--ink)' }}>
              폰 근접은 이렇게 안다
            </h3>
            <ol className="m-0 pl-5 grid gap-2 text-[16px] leading-[1.7] max-w-[62ch]" style={{ color: 'var(--ink)' }}>
              <li>기기가 BLE 비콘을 낸다.</li>
              <li>폰 앱이 비콘 영역에 들어온 걸 감지해 서버에 알린다.</li>
              <li>서버가 기기에 묻고, 기기가 레이더로 실제로 방에 있는지 확인한다.</li>
              <li>둘 다 맞으면 기기가 먼저 말을 건다.</li>
            </ol>
            <p className="mt-3 text-[15.5px] leading-[1.7] max-w-[62ch]" style={{ color: 'var(--ink-2)' }}>
              폰은 &ldquo;누구&rdquo;, 레이더는 &ldquo;정말 있는지&rdquo;를 맡는다.
            </p>
            <ul className="mt-4 m-0 p-0 list-none grid gap-2 max-w-[62ch]">
              <li className="pl-4 text-[15px] leading-[1.65]" style={{ borderLeft: '3px solid var(--accent)', color: 'var(--ink)' }}>
                iOS는 백그라운드 비콘 감지에 &ldquo;항상 허용&rdquo; 위치 권한이 필요할 것으로 본다(확인 필요).
              </li>
              <li className="pl-4 text-[15px] leading-[1.65]" style={{ borderLeft: '3px solid var(--accent)', color: 'var(--ink)' }}>
                감지 지연은 몇 초에서 몇십 초로 본다(추정). 그래서 &ldquo;문을 열자마자&rdquo;가 아니라 &ldquo;자리에 앉았을 때&rdquo; 말 걸도록
                설계한다.
              </li>
            </ul>
          </Section>

          <Section id="research" title="연구 질문과 실험 설계">
            <div className="grid gap-6">
              <Question no="1 · 핵심" title="먼저 말 거는 기기가, 내가 여는 앱보다 더 자주·더 오래 쓰이나?">
                교차 설계. 참가자 20~30명이 앱 모드 2주, 기기 모드 2주를 쓰고 순서는 무작위로 정한다. 하루 말한 시간(분), 계속 쓰는 비율, 기기가 말
                걸었을 때 응답한 비율을 잰다.
              </Question>
              <Question no="2" title="어떤 신호로 말 거는 게 제일 나은가?">
                정해진 시간만 · 레이더만 · 폰 근접만 · 폰+레이더를 비교한다. 응답률과 잘못 말 건 횟수(사람이 없거나 바쁠 때)를 잰다.
              </Question>
              <Question no="3 · 보조" title="말하기 실력이 달라지나?">
                전후 말하기 점수 변화를 본다. 4주·소수 참가자라 예비 근거로만 말한다.
              </Question>
            </div>
            <p className="mt-6 text-[15px] leading-[1.7] max-w-[62ch]" style={{ color: 'var(--ink-2)' }}>
              앞선 근거: 챗봇 언어 학습 메타분석에서 효과 크기 g≈0.53(Kim, 2023). 다만 대부분 작은 표본·짧은 기간 연구였고, 한국 학습자 대상 무작위
              대조 연구는 찾지 못했다.
            </p>
          </Section>

          <Section id="risks" title="위험과 대응">
            <dl className="m-0 grid gap-0" style={{ borderTop: '1px solid var(--rule)' }}>
              {RISKS.map((r) => (
                <div key={r.risk} className="grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6 py-4" style={{ borderBottom: '1px solid var(--rule)' }}>
                  <dt className="text-[16px] font-semibold" style={{ color: 'var(--ink)' }}>
                    {r.risk}
                  </dt>
                  <dd className="m-0 text-[15.5px] leading-[1.7]" style={{ color: 'var(--ink-2)' }}>
                    {r.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section id="roadmap" title="로드맵">
            <ol className="list-none m-0 p-0 grid gap-4">
              {ROADMAP.map((r, i) => (
                <li
                  key={r.step}
                  className="pl-4 grid gap-0.5"
                  style={{ borderLeft: r.now ? '3px solid var(--accent)' : '1px solid var(--rule)' }}
                >
                  <p className="text-[17px] font-semibold" style={{ color: 'var(--ink)' }}>
                    <span className="mr-2 text-[13px]" style={{ fontFamily: 'var(--font-mono)', color: r.now ? 'var(--accent)' : 'var(--muted)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {r.step}
                    {r.now && (
                      <span className="ml-2 text-[12.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                        지금
                      </span>
                    )}
                  </p>
                  <p className="text-[15.5px] leading-[1.65]" style={{ color: 'var(--ink-2)' }}>
                    {r.detail}
                  </p>
                </li>
              ))}
            </ol>
          </Section>
        </div>

        <aside
          className="mt-16 p-6 rounded-[var(--r-lg)] grid gap-3"
          style={{ background: 'var(--surface)', border: '1px solid var(--rule)', boxShadow: 'var(--shadow)' }}
          aria-labelledby="try-title"
        >
          <h2 id="try-title" className="text-[20px] font-semibold" style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            가상 기기로 해 보기
          </h2>
          <p className="text-[15.5px] leading-[1.7]" style={{ color: 'var(--ink-2)' }}>
            레이더·폰 근접·시간대를 켜고 끄면 기기가 먼저 말을 겁니다. 틀린 표현은 기억에 쌓이고 다음 날 다시 묻습니다. 마이크가 없으면 글로
            대답해도 됩니다.
          </p>
          <div>
            <Link href="/portfolio/english-roommate/demo" className="btn btn-primary">
              데모 열기 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </aside>

        <footer className="mt-16 pt-6 text-[15px] flex justify-between" style={{ borderTop: '1px solid var(--rule)' }}>
          <Link href="/portfolio" className="link-u">
            ← 포트폴리오
          </Link>
          <Link href="/portfolio/english-roommate/demo" className="link-u">
            데모 →
          </Link>
        </footer>
      </article>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="contents">
      <dt className={`${LABEL} pt-0.5`} style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
        {label}
      </dt>
      <dd className="m-0" style={{ color: 'var(--ink)' }}>
        {children}
      </dd>
    </div>
  );
}

function Decision({ what, children }: { what: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="grid gap-1">
      <p className="text-[17px] font-semibold" style={{ color: 'var(--ink)' }}>
        {what}
      </p>
      <p className="text-[16px] leading-[1.7] max-w-[60ch]" style={{ color: 'var(--ink-2)' }}>
        {children}
      </p>
    </div>
  );
}

function Question({ no, title, children }: { no: string; title: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="pl-4 grid gap-1" style={{ borderLeft: '1px solid var(--rule)' }}>
      <p className={LABEL} style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
        연구 질문 {no}
      </p>
      <p className="text-[17px] font-semibold leading-[1.5]" style={{ color: 'var(--ink)' }}>
        {title}
      </p>
      <p className="text-[15.5px] leading-[1.7] max-w-[62ch]" style={{ color: 'var(--ink-2)' }}>
        {children}
      </p>
    </div>
  );
}
