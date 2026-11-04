import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { OG_IMAGES, TWITTER_IMAGES } from '@/components/seo/ogMeta';
import { CountUp, MotionScope } from '@/features/capstone/motion';
import AppHero from '@/features/seniorcat/AppHero';
import Spark, { type SparkShape } from '@/features/seniorcat/Spark';
import SystemDiagram from '@/features/seniorcat/SystemDiagram';
import '@/features/seniorcat/seniorcat.css';

// 졸업작품 구상 "노령묘 화장실 무게 센서" 설명 페이지. 한국어만 있다(포트폴리오 상세와 같다).
// 형식: 이 구상이 될 "보호자 앱 / 건강 수첩" — 첫 화면은 앱 홈 목업, 본문은 둥근 수첩 카드. 긴 표·출처·수치는 카드 안 <details>에 접어 둔다.
// 데이터 없이 코드에 쓴 정적 페이지라 빌드 때 만들어 둔다. /portfolio/[id]보다 이 정적 경로가 먼저 잡힌다.
// 숫자는 원문을 직접 연 것만 싣고 출처·상태를 붙인다. 진단처럼 읽히는 표현("~병입니다")은 쓰지 않는다.

const URL = `${SITE_URL}/portfolio/senior-cat`;
const TITLE = '노령묘 화장실 무게 센서 — 포트폴리오 | 여준수';
const DESCRIPTION = '고양이 화장실 밑 무게 센서로 체중·방문 횟수·소변량·머문 시간을 매일 기록하고, 그 고양이의 평소에서 벗어나면 검진을 권하는 행동 변화 알림 구상과 웹 데모.';

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

const DEMO = '/portfolio/senior-cat/demo';
const CORNELL_CKD =
  'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/chronic-kidney-disease';
const CORNELL_FLUTD =
  'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-lower-urinary-tract-disease';
const PURINA_2026 = 'https://doi.org/10.3390/ani16091319';

const FACTS: { claim: string; source: string; href: string; status: string }[] = [
  {
    claim: '만성 신장병(CKD)은 노령묘에 가장 흔한 병 중 하나로, 10살 넘은 고양이의 최대 40%, 15살 넘은 고양이의 80%에 생긴다.',
    source: 'Cornell Feline Health Center',
    href: CORNELL_CKD,
    status: '원문 확인 · 교육용 자료',
  },
  {
    claim: '초기에는 증상이 거의 없다. 혈액 크레아티닌은 신장 기능을 약 75% 잃을 때까지 잘 오르지 않는다(SDMA는 약 40%에서).',
    source: 'Cornell Feline Health Center',
    href: CORNELL_CKD,
    status: '원문 확인',
  },
  {
    claim: '요도가 막히면 "절대 응급"이다. 완전히 막힌 뒤 24~48시간 안에 죽을 수도 있고, 수컷이 해부학적으로 더 위험하다.',
    source: 'Cornell Feline Health Center (FLUTD)',
    href: CORNELL_FLUTD,
    status: '원문 확인',
  },
  {
    claim:
      '화장실 무게 센서 기록으로 CKD 고양이를 가려낸 연구: 136마리(CKD 20·비신장 116). CKD 고양이는 하루 평균 소변 4.6회로 비신장 2.3회의 두 배였고, 7일 소변 무게 합도 1,007g 대 470g이었다. 행동 특징 모델의 weighted F1은 학습 92.7%, 검증 89.9%.',
    source: 'Langenfeld-McCoy 외, Animals 16(9):1319, 2026 (Nestlé Purina·Ohio State)',
    href: PURINA_2026,
    status: '원문 확인 · 기기 회사 연구',
  },
];

const MEASURES: { what: string; how: string; why: string; shape: SparkShape }[] = [
  { what: '체중', how: '고양이가 안에서 가만히 있는 동안의 무게 − 들어가기 전 모래 무게', why: '천천히 빠지는 체중', shape: 'down' },
  { what: '방문 횟수', how: '모래보다 1kg 넘게 무거워졌다가 돌아온 횟수', why: '자주 들락거림', shape: 'spike' },
  { what: '소변 횟수·양', how: '나온 뒤 모래 무게 − 들어가기 전 모래 무게, 한 번 길게 멈춘 자세면 소변', why: '소변이 늘거나 안 나옴', shape: 'up' },
  { what: '대변 횟수', how: '모래 무게가 늘었고, 멈췄다 힘주기를 반복한 자세', why: '대변이 줆', shape: 'drop' },
  { what: '머문 시간', how: '들어온 시각부터 나간 시각까지', why: '오래 버팀 · 다묘 구분 보조', shape: 'flat' },
];

const URGENT = {
  signals: ['6시간에 4번 넘게 들어갔는데 모래 무게가 거의 늘지 않음', '평소 하루 두 번 보던 소변 기록이 36시간 없음'],
  message: '소변이 안 나오는 상태일 수 있어요. 지금 동물병원에 연락해 보세요.',
};

const SLOW: { signal: string; message: string }[] = [
  { signal: '소변 횟수·양이 몇 주에 걸쳐 늚', message: '평소보다 소변이 n% 많아요. 검진을 받아 볼 때입니다.' },
  { signal: '체중이 천천히 빠짐', message: '최근 7일 체중이 평소보다 n% 적어요. 검진을 받아 볼 때입니다.' },
  { signal: '대변 횟수가 줆', message: '대변 횟수가 평소보다 줄었어요. 검진을 받아 볼 때입니다.' },
];

const HARDWARE: { part: string; why: string }[] = [
  { part: '로드셀 4개 + HX711', why: '화장실을 올려놓는 판의 네 모서리에 하중 센서를 두고, 24비트 ADC로 10Hz 읽는다. 모래 5kg + 고양이 5kg를 g 단위로 본다.' },
  { part: 'ESP32 (또는 STM32 + 무선 모듈)', why: '1초 평균값을 만들고 방문만 잘라서 와이파이로 보낸다. 평소엔 10분에 한 번만 보내 전력과 데이터를 아낀다.' },
  { part: '판 · 미끄럼 방지 다리', why: '어떤 화장실이든 위에 올리면 되게. 카펫 위에서는 무게가 덜 잡혀 단단한 바닥을 권한다.' },
  { part: '카메라·마이크 없음', why: '집 안 사진을 찍지 않는다. 실험 때 정답을 붙이는 카메라는 자원 가구에서 따로, 동의를 받고만 쓴다.' },
];

const COMPETITORS: { name: string; what: string; gap: string }[] = [
  {
    name: 'Purina Petivity 화장실 모니터',
    what: '화장실 밑 패드로 체중·화장실 습관을 기록하고 앱으로 알린다. 미국 공식 가격 US$129.99(2026-11-04 조회). 다묘 개체 구분 기능이 있다.',
    gap: '한국 판매 여부는 확인하지 못했다. 이 구상은 노령묘 보호자와 동물병원에 맞춘 한국어 리포트를 앞세운다.',
  },
  {
    name: 'Whisker Litter-Robot 4',
    what: '자동 청소 화장실에 체중 저울이 들어 있다. 공식 사이트 "As low as $699".',
    gap: '화장실 자체를 바꿔야 하고 비싸다. 이 구상은 쓰던 화장실 밑에 판만 깐다.',
  },
  {
    name: 'PETKIT·국내 스마트 화장실',
    what: '자동 청소 제품군이 있다.',
    gap: '판매 페이지에 접속하지 못해 무게 기록 기능과 가격은 확인하지 못했다(미확인).',
  },
];

const EDGE: { what: string; detail: string }[] = [
  { what: '노령묘', detail: '9살 넘은 고양이의 "평소 대비 변화"만 본다. 기능을 늘리지 않는다.' },
  { what: '다묘', detail: '구분이 애매한 방문을 숨기지 않고 확률로 나눠 세고, 체중이 비슷하면 미리 알린다.' },
  { what: '병원 리포트', detail: '수의사가 1분 안에 읽을 한 쪽 — 평소와 최근 7일 비교, 알림 기록, "진단이 아닙니다".' },
];

const RISKS: { risk: string; answer: string }[] = [
  { risk: '틀린 알림', answer: '엉뚱한 알림이 잦으면 보호자가 끈다. 기준선 기간·문턱값을 시뮬레이션으로 먼저 고르고, 자원 가구 데이터와 수의사 의견으로 다시 맞춘다.' },
  { risk: '놓친 알림', answer: '"알림이 없으니 괜찮다"로 읽히지 않게, 이 기기가 보지 못하는 것(물 마신 양, 화장실 밖 소변)을 앱에 적어 둔다.' },
  { risk: '데이터', answer: '무게 기록만 모은다. 원신호는 보호자 계정에만 두고, 연구에 쓸 때는 따로 동의를 받는다.' },
  { risk: '경쟁', answer: '큰 회사 제품이 이미 있다. 노령묘·다묘·병원 리포트라는 좁은 쓰임에서 먼저 쓸모를 보인다.' },
];

const SIM_RESULTS = [
  '세 마리(3.6·4.2·4.4kg): 방문의 5.5%가 "구분 어려움", 구분한 것 중 97%가 맞음.',
  '기준선을 14일 → 21일로 늘리면 정상 시나리오의 엉뚱한 알림이 100 고양이-일당 0.44 → 0.19로 줄고, 검출 지연은 거의 그대로(15일 → 16일).',
  '소변이 3주에 걸쳐 늘 때 검출까지 중앙값 16일, 체중이 5주에 8% 빠질 때 18일(약 4% 빠진 시점).',
  '소변이 안 나오는 방문이 이어질 때 급한 변화 알림까지 약 2.6시간.',
];

const ROADMAP: { step: string; detail: string; now?: boolean }[] = [
  { step: '시뮬레이터 + 알고리즘 웹 데모', detail: '무게 신호 생성 → 방문 검출 → 고양이 구분 → 기준선·알림 → 리포트. 이 페이지의 데모.', now: true },
  { step: '저울 시제품', detail: '로드셀 4개·HX711·ESP32로 판을 만들고, 모래·물병으로 g 단위 정확도를 잰다.' },
  { step: '자원 가구 파일럿', detail: '9살 넘은 고양이를 키우는 집 몇 곳에서 4~8주. 카메라로 정답을 붙여 방문 검출·종류·구분 정확도를 잰다.' },
  { step: '보호소·다묘 가구', detail: '체중이 비슷한 고양이 여럿이 화장실 하나를 쓰는 환경에서 구분 성능을 본다.' },
  { step: '수의사와 문턱값 정하기', detail: '어느 정도 바뀌면 검진을 권할지, 리포트에 무엇을 넣을지 동물병원과 맞춘다.' },
];

const TOC: { id: string; label: string }[] = [
  { id: 'why', label: '왜 필요한가' },
  { id: 'measure', label: '무엇을 재나' },
  { id: 'urgent', label: '급한 변화' },
  { id: 'slow', label: '느린 변화' },
  { id: 'system', label: '어떻게 동작하나' },
  { id: 'multi', label: '여러 마리 구분' },
  { id: 'research', label: '검증 계획' },
  { id: 'compare', label: '경쟁과 차별점' },
  { id: 'risks', label: '위험' },
  { id: 'roadmap', label: '로드맵' },
];

/** 카드 번호(01…)는 차례(TOC) 순서에서 가져온다 */
const no = (id: string): string => String(TOC.findIndex((t) => t.id === id) + 1).padStart(2, '0');

const BODY = 'text-[16px] leading-[1.7]';

export default function SeniorCatPage(): JSX.Element {
  return (
    <main className="sc">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-16">
        <Link href="/portfolio" className="inline-flex items-center gap-1 min-h-[44px] text-[14px] underline-offset-4 hover:underline" style={{ color: 'var(--sc-muted)' }}>
          <span aria-hidden="true">←</span> 전체 프로젝트 보기
        </Link>

        {/* 첫 화면: 앱 소개 + 앱 홈 목업 */}
        <header className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12 lg:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="sc-eyebrow">졸업작품 구상 · 보호자 앱</span>
              <span className="sc-pill">구상 · 웹 데모</span>
            </div>
            <h1 className="sc-title text-[34px] sm:text-[44px] mb-4">노령묘 화장실 무게 센서</h1>
            <p className="text-[18px] sm:text-[19px] leading-[1.65] max-w-[42ch]" style={{ color: 'var(--sc-ink)' }}>
              화장실 밑 저울이 체중·방문 횟수·소변량·머문 시간을 매일 적고, 그 고양이의 평소에서 벗어나면 &ldquo;검진 받아 볼 때&rdquo;라고 알려 준다.
            </p>
            <dl aria-label="한눈에" className="m-0 mt-6 grid gap-2 sm:grid-cols-2 max-w-[560px]">
              <Fact label="대상">9살 넘은 고양이를 키우고, 검진은 1년에 1~2번인 1~2인 가구</Fact>
              <Fact label="형태">쓰던 화장실 밑에 까는 무게 판 + 폰 알림 + 병원 리포트</Fact>
              <Fact label="하는 일">행동 변화 알림 · 검진 권유 (진단하지 않는다)</Fact>
              <Fact label="지금">시뮬레이터와 알고리즘 웹 데모 (2026-11)</Fact>
            </dl>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={DEMO} className="btn btn-primary">
                시뮬레이터 데모 열기 <span aria-hidden="true">→</span>
              </Link>
              <a href="#journal" className="btn btn-ghost">
                건강 수첩 펼쳐 보기
              </a>
            </div>
          </div>
          <div className="min-w-0">
            <AppHero />
          </div>
        </header>

        {/* 건강 수첩 */}
        <h2 id="journal" className="mt-14 sm:mt-16 mb-3 scroll-mt-24 text-[15px] font-semibold" style={{ color: 'var(--sc-muted)' }}>
          건강 수첩 — 구상의 10쪽
        </h2>
        <nav aria-label="건강 수첩 차례" className="sc-tabs mb-5">
          {TOC.map((t) => (
            <a key={t.id} href={`#${t.id}`}>
              {t.label}
            </a>
          ))}
        </nav>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card id="why" title="왜 필요한가" wide>
            <p className={`${BODY} max-w-[78ch]`} style={{ color: 'var(--sc-ink)' }}>
              나이 든 고양이의 병은 조용히 온다. 검진은 1년에 한두 번이고, 그 사이의 매일을 보는 사람이 없다. 그런데 고양이는 하루에도 몇 번씩 같은 자리, 화장실에
              간다. 병을 알아맞히려는 게 아니라 <b>그 고양이의 평소</b>를 기록해 두었다가 달라지면 &ldquo;병원에 가 볼 때&rdquo;라고 알린다.
            </p>
            <dl className="m-0 mt-5 grid gap-3 sm:grid-cols-3">
              <Stat
                value={
                  <>
                    <CountUp to={40} />
                    <span className="text-[18px] mx-1" style={{ color: 'var(--sc-muted)' }}>
                      ·
                    </span>
                    <CountUp to={80} />
                  </>
                }
                unit="%"
                label="만성 신장병(CKD)이 생기는 비율: 10살 넘은 고양이 최대 40% · 15살 넘은 고양이 80%"
                source="Cornell Feline Health Center"
                status="원문 확인 · 교육용 자료"
              />
              <Stat
                value={
                  <>
                    <CountUp to={4.6} decimals={1} />
                    <span className="text-[18px] mx-1" style={{ color: 'var(--sc-muted)' }}>
                      vs
                    </span>
                    <CountUp to={2.3} decimals={1} />
                  </>
                }
                unit="회/일"
                label="하루 소변 횟수: 신장병 고양이 vs 신장병 아닌 고양이"
                source="Purina·Ohio State, Animals 2026"
                status="원문 확인 · 기기 회사 연구"
              />
              <Stat value={<>24~48</>} unit="시간" label='요도가 완전히 막힌 뒤 죽을 수도 있는 시간 — "절대 응급"' source="Cornell Feline Health Center (FLUTD)" status="원문 확인" />
            </dl>
            <p className="mt-3 sc-small">
              국내 반려묘 수와 노령묘 진료 통계도 찾았지만 원문을 열어 확인하지 못해 싣지 않았다. 아래 연구는 기기를 만든 회사가 쓴 것이고 CKD 고양이가 20마리뿐이라,
              이 구상의 근거는 &ldquo;화장실 행동에 신호가 있다&rdquo;까지만이다.
            </p>
            <details className="sc-more">
              <summary>근거 원문 4개 · 출처와 확인 상태</summary>
              <ul className="sc-more-body m-0 p-0 list-none grid gap-x-8 lg:grid-cols-2" aria-label="근거">
                {FACTS.map((f) => (
                  <li key={f.claim} className="grid gap-1.5 content-start py-3" style={{ borderTop: '1px solid var(--sc-line)' }}>
                    <p className="text-[14.5px] leading-[1.6]" style={{ color: 'var(--sc-ink)' }}>
                      {f.claim}
                    </p>
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]" style={{ color: 'var(--sc-muted)' }}>
                      <a href={f.href} className="link-u" target="_blank" rel="noopener noreferrer">
                        {f.source}
                      </a>
                      <StatusPills status={f.status} />
                    </p>
                  </li>
                ))}
              </ul>
            </details>
          </Card>

          <Card id="measure" title="무엇을 재나" wide>
            <MotionScope>
              <ul className="m-0 p-0 list-none grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                {MEASURES.map((m, i) => (
                  <li key={m.what} className="sc-tile grid gap-2 content-start">
                    <p className="text-[16px] font-bold" style={{ color: 'var(--sc-ink)' }}>
                      {m.what}
                    </p>
                    <Spark kind={m.shape} delay={0.2 + i * 0.12} />
                    <p className="text-[13.5px] leading-[1.45]" style={{ color: 'var(--sc-ink-2)' }}>
                      <span className="sr-only">보는 변화: </span>
                      {m.why}
                    </p>
                  </li>
                ))}
              </ul>
            </MotionScope>
            <p className="mt-2 sc-small">저울 하나로 다섯 가지를 매일 적는다. 선은 &ldquo;어떤 변화를 보는지&rdquo;를 그린 모양 예시이고 실측이 아니다.</p>
            <p className="sc-note mt-3">
              <b>핵심 관찰</b> — 고양이가 안에서 소변을 봐도 저울 위 총무게는 그대로다. 소변이 몸에서 모래로 옮겨 갈 뿐이다. 그래서 배설량은 나간 뒤 안정된 모래
              무게에서 들어가기 전 무게를 빼서 잰다.
            </p>
            <details className="sc-more">
              <summary>측정값마다 재는 방법</summary>
              <div className="sc-more-body overflow-x-auto">
                <table className="sc-table min-w-[480px]">
                  <caption className="sr-only">측정값과 재는 방법</caption>
                  <thead>
                    <tr>
                      <th scope="col">측정값</th>
                      <th scope="col">재는 방법</th>
                      <th scope="col">보는 변화</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MEASURES.map((m) => (
                      <tr key={m.what}>
                        <th scope="row" className="font-semibold whitespace-nowrap" style={{ color: 'var(--sc-ink)' }}>
                          {m.what}
                        </th>
                        <td>{m.how}</td>
                        <td style={{ color: 'var(--sc-ink)' }}>{m.why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </Card>

          <Card id="urgent" title="급한 변화" tone="sc-urgent" badge={<span className="sc-pill sc-pill-red">시간 단위</span>}>
            <ul className="m-0 pl-5 grid gap-1.5 text-[15.5px] leading-[1.6] list-disc" style={{ color: 'var(--sc-ink)' }}>
              {URGENT.signals.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="mt-4 mb-1.5 text-[12.5px] font-semibold" style={{ color: 'var(--sc-red)' }}>
              앱 알림 문구
            </p>
            <p className="sc-note" style={{ borderColor: 'var(--sc-red-line)' }}>
              &ldquo;{URGENT.message}&rdquo;
              <span className="block mt-1 text-[13.5px]" style={{ color: 'var(--sc-ink-2)' }}>
                수컷이면 서두르라고 덧붙인다.
              </span>
            </p>
            <p className="mt-4 sc-small">시뮬레이터에서 소변이 안 나오는 방문이 이어질 때 급한 변화 알림까지 약 2.6시간 (시뮬레이션 예비 결과).</p>
          </Card>

          <Card id="slow" title="느린 변화" tone="sc-slow" badge={<span className="sc-pill">주 단위</span>}>
            <ul className="m-0 p-0 list-none grid gap-2.5">
              {SLOW.map((c) => (
                <li key={c.signal} className="grid gap-1">
                  <p className="text-[15px] font-semibold" style={{ color: 'var(--sc-ink)' }}>
                    {c.signal}
                  </p>
                  <p className="sc-note" style={{ fontSize: 14.5, padding: '7px 12px' }}>
                    <span className="sr-only">앱 알림 문구: </span>&ldquo;{c.message}&rdquo;
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-3 sc-small">소변이 느는 원인은 여럿이라 병 이름은 말하지 않는다.</p>
            <details className="sc-more">
              <summary>기준선과 문턱값 (알고리즘)</summary>
              <div className="sc-more-body grid gap-3">
                <p>
                  <b style={{ color: 'var(--sc-ink)' }}>기준선은 고양이마다 따로.</b> 처음 몇 주(데모 기본 21일)를 그 고양이의 평소로 삼는다. 다른 고양이 평균이 아니라
                  자기 자신과 비교한다. 이후엔 최근 7일 평균을 기준선과 비교하고, 누적합(CUSUM) 변화점 검출로 &ldquo;언제부터 달라졌나&rdquo;를 같이 추정한다.
                </p>
                <p>
                  <b style={{ color: 'var(--sc-ink)' }}>문턱값은 임시값.</b> 데모의 문턱(급한 변화: 6시간에 배설 없는 방문 4번 · 느린 변화: 7일 평균 ±25% 등)은
                  시뮬레이션으로 고른 값이다. 실제 값은 수의사 의견과 자원 가구 데이터로 정한다.
                </p>
              </div>
            </details>
          </Card>

          <Card id="system" title="어떻게 동작하나" wide>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-10 lg:items-center">
              <SystemDiagram />
              <div className="min-w-0">
                <ol className="m-0 p-0 list-none grid gap-2.5 text-[15px] leading-[1.6]" style={{ color: 'var(--sc-ink)' }}>
                  {[
                    ['저울', '로드셀 4개가 화장실 무게를 10Hz로 읽는다'],
                    ['기기', '방문만 잘라 와이파이로 보낸다'],
                    ['서버', '고양이 구분 · 기준선 비교 · 알림'],
                    ['폰', '행동 변화 알림과 병원 리포트(1쪽)'],
                  ].map(([k, v]) => (
                    <li key={k} className="flex gap-3 items-baseline">
                      <span className="sc-pill sc-pill-quiet shrink-0">{k}</span>
                      <span>{v}</span>
                    </li>
                  ))}
                </ol>
                <details className="sc-more">
                  <summary>하드웨어 구성</summary>
                  <dl className="sc-more-body m-0 grid gap-3">
                    {HARDWARE.map((h) => (
                      <div key={h.part}>
                        <dt className="font-semibold" style={{ color: 'var(--sc-ink)' }}>
                          {h.part}
                        </dt>
                        <dd className="m-0">{h.why}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
                <details className="sc-more">
                  <summary>부품값 (2026-11-04 조회)</summary>
                  <p className="sc-more-body">
                    미국 소매가로 50kg 하중 센서 4개 US$25, HX711 보드 US$4.95, ESP32 개발 보드 US$15 — 합해 약 US$45다(SparkFun·Adafruit, 2026-11-04 조회).
                    국내 호환 부품으로 3~5만 원을 목표로 잡았지만 국내 가격은 아직 확인하지 않았다.
                  </p>
                </details>
              </div>
            </div>
          </Card>

          <Card id="multi" title="여러 마리 구분" badge={<span className="sc-pill">연구 질문 1 · 핵심</span>}>
            <p className="text-[17px] font-semibold leading-[1.5] mb-2" style={{ color: 'var(--sc-ink)' }}>
              화장실 하나를 2~3마리가 같이 쓸 때, 체중으로 누가 다녀갔는지 가릴 수 있나?
            </p>
            <p className="text-[15.5px] leading-[1.7]" style={{ color: 'var(--sc-ink-2)' }}>
              고양이마다 체중 분포를 두고 방문마다 확률을 낸다. 확률이 80%보다 낮으면 억지로 정하지 않고 &ldquo;구분 어려움&rdquo;으로 둔다. 체중에 머문 시간·방문
              시간대를 더하면 얼마나 나아지는지, 체중 차이가 몇 g까지 줄면 무너지는지를 잰다.
            </p>
            <WeightLine />
            <p className="sc-note mt-3" style={{ fontSize: 14.5 }}>
              <span className="sc-pill mr-1.5" style={{ fontSize: 11.5, padding: '1px 8px' }}>
                시뮬레이션
              </span>
              세 마리(3.6·4.2·4.4kg): 방문의 <b>5.5%</b>가 &ldquo;구분 어려움&rdquo;, 구분한 것 중 <b>97%</b>가 맞음. 실제 고양이 데이터가 아니다.
            </p>
          </Card>

          <Card id="research" title="검증 계획" badge={<span className="sc-pill">연구 질문 2</span>}>
            <p className="text-[17px] font-semibold leading-[1.5] mb-2" style={{ color: 'var(--sc-ink)' }}>
              그 고양이의 평소에서 벗어난 걸 며칠 만에 알아채나?
            </p>
            <p className="text-[15.5px] leading-[1.7]" style={{ color: 'var(--sc-ink-2)' }}>
              변화가 시작된 날부터 알림까지 걸린 날수(검출 지연)와, 아무 일 없을 때 울린 알림 수(엉뚱한 알림)를 같이 본다. 기준선 기간·문턱값을 바꿔 둘의 균형을
              찾는다.
            </p>
            <details className="sc-more">
              <summary>데이터는 이렇게 모은다 (3가지)</summary>
            <ol className="sc-more-body m-0 pl-5 grid gap-1.5 list-decimal">
              <li>자원 가구: 9살 넘은 고양이를 키우는 집에서 4~8주, 저울 기록과 화장실 쪽 카메라(동의한 기간만)로 정답을 붙인다.</li>
              <li>보호소·다묘 가구: 체중이 비슷한 고양이 여럿이 한 화장실을 쓰는 곳에서 구분 성능만 따로 본다.</li>
              <li>아픈 고양이를 일부러 모으거나 병을 맞혔다고 주장하지 않는다. 확인하는 것은 &ldquo;행동 기록이 정확한가&rdquo;와 &ldquo;평소에서 벗어남을 잡는가&rdquo;다.</li>
            </ol>
            </details>
            <details className="sc-more">
              <summary>시뮬레이터로 먼저 잰 값 (4개)</summary>
              <div className="sc-more-body">
                <p className="mb-2">
                  데모의 시뮬레이터(시드 20개 × 90일)에서 잰 예비 결과다. <b>실제 고양이 데이터가 아니라</b> 시뮬레이터 가정에서만 의미가 있다.
                </p>
                <ul className="m-0 pl-5 grid gap-1.5 list-disc" style={{ color: 'var(--sc-ink)' }}>
                  {SIM_RESULTS.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </details>
          </Card>

          <Card id="compare" title="경쟁과 차별점">
            <ul className="m-0 p-0 list-none grid gap-3">
              {EDGE.map((e) => (
                <li key={e.what} className="grid gap-0.5 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-3">
                  <span className="text-[15px] font-bold" style={{ color: 'var(--sc-teal)' }}>
                    {e.what}
                  </span>
                  <span className="text-[15px] leading-[1.6]" style={{ color: 'var(--sc-ink)' }}>
                    {e.detail}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex flex-wrap gap-2" aria-hidden="true">
              {COMPETITORS.map((c) => (
                <span key={c.name} className="sc-pill sc-pill-quiet">
                  {c.name}
                </span>
              ))}
            </p>
            <details className="sc-more">
              <summary>이미 있는 제품 3개 (가격·조회일)</summary>
              <dl className="sc-more-body m-0 grid gap-3">
                {COMPETITORS.map((c) => (
                  <div key={c.name}>
                    <dt className="font-semibold" style={{ color: 'var(--sc-ink)' }}>
                      {c.name}
                    </dt>
                    <dd className="m-0">{c.what}</dd>
                    <dd className="m-0" style={{ color: 'var(--sc-ink)' }}>
                      {c.gap}
                    </dd>
                  </div>
                ))}
              </dl>
            </details>
          </Card>

          <Card id="risks" title="위험">
            <div className="sc-note" style={{ background: 'var(--sc-teal-soft)', borderColor: 'var(--sc-teal-line)' }}>
              <p className="font-semibold mb-1">진단처럼 보이는 표현</p>
              <p className="text-[14.5px] leading-[1.65]" style={{ color: 'var(--sc-ink-2)' }}>
                수의사법은 수의사가 아닌 사람의 진료를 금지한다. 화면·알림·리포트에 병 이름을 결론으로 쓰지 않고 &ldquo;행동 변화 알림&rdquo;과 &ldquo;검진 권유&rdquo;만 쓴다.
                리포트 첫머리에 &ldquo;진단이 아닙니다&rdquo;를 넣는다.
              </p>
            </div>
            <div className="mt-2">
              {RISKS.map((r) => (
                <details key={r.risk} className="sc-more" style={{ marginTop: 6 }}>
                  <summary>{r.risk}</summary>
                  <p className="sc-more-body" style={{ paddingTop: 6 }}>
                    {r.answer}
                  </p>
                </details>
              ))}
            </div>
          </Card>

          <Card id="roadmap" title="로드맵" wide>
            <ol className="m-0 p-0 list-none grid gap-4 lg:grid-cols-5 lg:gap-4 relative">
              {ROADMAP.map((r, i) => (
                <li key={r.step} className={`grid grid-cols-[30px_minmax(0,1fr)] gap-3 lg:grid-cols-1 lg:gap-2 content-start ${r.now ? 'sc-step-now' : ''}`}>
                  <span className="sc-step-dot" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15.5px] font-bold leading-[1.4]" style={{ color: 'var(--sc-ink)' }}>
                      {r.step}
                      {r.now && <span className="sc-pill ml-2 align-[1px]">지금</span>}
                    </p>
                    <p className="mt-1 text-[14px] leading-[1.6]" style={{ color: 'var(--sc-ink-2)' }}>
                      {r.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* 끝 CTA */}
        <aside
          className="mt-5 sc-card grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
          style={{ background: 'var(--sc-teal-soft)', borderColor: 'var(--sc-teal-line)' }}
          aria-labelledby="try-title"
        >
          <div>
            <h2 id="try-title" className="sc-card-h">
              시뮬레이터로 해 보기
            </h2>
            <p className="mt-1 text-[15.5px] leading-[1.65] max-w-[62ch]" style={{ color: 'var(--sc-ink-2)' }}>
              고양이 1~3마리의 체중을 정하고 시나리오를 고른 뒤 날을 넘깁니다. 저울 원신호부터 방문 검출, 고양이 구분, 기준선, 알림, 병원 리포트까지 전부 브라우저에서
              계산합니다.
            </p>
          </div>
          <Link href={DEMO} className="btn btn-primary justify-self-start">
            데모 열기 <span aria-hidden="true">→</span>
          </Link>
        </aside>

        <footer className="mt-10 pt-5 text-[15px] flex justify-between gap-4" style={{ borderTop: '1px solid var(--sc-line)' }}>
          <Link href="/portfolio" className="link-u inline-flex items-center min-h-[44px]">
            ← 포트폴리오
          </Link>
          <Link href={DEMO} className="link-u inline-flex items-center min-h-[44px]">
            데모 →
          </Link>
        </footer>
        <p className="mt-3 sc-small max-w-[80ch]">
          AI 이미지 표시: 이 페이지의 사진은 실제 촬영이 아니라, 이 작업용 맥에서 오픈소스 모델(FLUX.2 klein 4B, Apache-2.0)로 만든 AI 이미지입니다. 사람·실제 제품은
          나오지 않습니다. 폰 화면은 HTML로 그린 예시이고 안의 수치는 시뮬레이션입니다.
        </p>
      </div>
    </main>
  );
}

interface CardProps {
  id: string;
  title: string;
  wide?: boolean;
  tone?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

function Card({ id, title, wide, tone, badge, children }: CardProps): JSX.Element {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`sc-card scroll-mt-24 ${wide ? 'lg:col-span-2' : ''} ${tone ?? ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 id={`${id}-title`} className="sc-card-h">
          <span className="sc-card-no" aria-hidden="true">
            {no(id)}
          </span>
          {title}
        </h2>
        {badge}
      </div>
      {children}
    </section>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="rounded-[16px] px-3.5 py-2.5" style={{ background: 'var(--sc-card)', border: '1px solid var(--sc-line)' }}>
      <dt className="text-[12.5px] font-semibold" style={{ color: 'var(--sc-teal)' }}>
        {label}
      </dt>
      <dd className="m-0 text-[14.5px] leading-[1.5]" style={{ color: 'var(--sc-ink)' }}>
        {children}
      </dd>
    </div>
  );
}

interface StatProps {
  value: React.ReactNode;
  unit: string;
  label: string;
  source: string;
  status: string;
}

function Stat({ value, unit, label, source, status }: StatProps): JSX.Element {
  return (
    // 읽는 순서는 이름 → 값(dl 규칙), 보이는 순서는 값이 먼저
    <div className="sc-tile grid content-start gap-1.5">
      <dt className="order-2 text-[14px] leading-[1.5]" style={{ color: 'var(--sc-ink)' }}>
        {label}
      </dt>
      <dd className="m-0 order-1 leading-none" style={{ color: 'var(--sc-teal)' }}>
        <span className="text-[30px] font-bold tracking-[-0.02em]" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </span>
        <span className="ml-1 text-[15px] font-semibold">{unit}</span>
      </dd>
      <dd className="m-0 order-3 flex flex-wrap items-center gap-1.5 text-[12.5px]" style={{ color: 'var(--sc-muted)' }}>
        {source}
        <StatusPills status={status} small />
      </dd>
    </div>
  );
}

/** "원문 확인 · 기기 회사 연구" 같은 상태 표시를 알약 여러 개로. 원문을 연 것은 청록, 나머지 성격 표시는 회색. */
function StatusPills({ status, small }: { status: string; small?: boolean }): JSX.Element {
  return (
    <>
      {status.split(' · ').map((st) => (
        <span key={st} className={`sc-pill ${st === '원문 확인' ? '' : 'sc-pill-quiet'}`} style={small ? { fontSize: 11.5, padding: '1px 8px' } : undefined}>
          {st}
        </span>
      ))}
    </>
  );
}

/** 세 마리의 등록 체중을 한 줄 위에 찍는다. 4.2·4.4kg 두 마리는 가까워서 구분이 어려운 방문이 생긴다. */
function WeightLine(): JSX.Element {
  const LO = 3.4;
  const HI = 4.6;
  const cats = [
    { name: '보리', kg: 3.6 },
    { name: '콩이', kg: 4.2 },
    { name: '두부', kg: 4.4 },
  ];
  const pos = (kg: number): string => `${((kg - LO) / (HI - LO)) * 100}%`;
  return (
    <figure className="m-0 mt-5">
      <div className="relative h-[64px] mx-6" aria-hidden="true">
        <div className="absolute left-[-12px] right-[-12px] top-[22px] h-[6px] rounded-full" style={{ background: 'var(--sc-sunk)' }} />
        <div className="absolute top-[22px] h-[6px] rounded-full" style={{ left: pos(4.2), width: `calc(${pos(4.4)} - ${pos(4.2)})`, background: 'var(--sc-red-line)' }} />
        {cats.map((c, i) => (
          <div
            key={c.name}
            className={`absolute -translate-x-1/2 flex items-center gap-1.5 ${i === 1 ? 'flex-col-reverse top-[18px]' : 'flex-col top-0'}`}
            style={{ left: pos(c.kg) }}
          >
            <span className="text-[12px] font-semibold whitespace-nowrap leading-none" style={{ color: 'var(--sc-ink)' }}>
              {c.name} {c.kg}kg
            </span>
            <span className="w-[14px] h-[14px] rounded-full" style={{ background: 'var(--sc-teal)', boxShadow: '0 0 0 3px var(--sc-card)' }} />
          </div>
        ))}
      </div>
      <figcaption className="sc-small mt-1">콩이와 두부는 0.2kg 차이 — 체중만으로는 구분이 어려운 방문이 생긴다(예시 체중).</figcaption>
    </figure>
  );
}
