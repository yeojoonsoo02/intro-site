import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { OG_IMAGES, TWITTER_IMAGES } from '@/components/seo/ogMeta';
import SystemDiagram from '@/features/seniorcat/SystemDiagram';

// 졸업작품 구상 "노령묘 화장실 무게 센서" 설명 페이지. 한국어만 있다(포트폴리오 상세와 같다).
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

const MEASURES: { what: string; how: string; why: string }[] = [
  { what: '체중', how: '고양이가 안에서 가만히 있는 동안의 무게 − 들어가기 전 모래 무게', why: '천천히 빠지는 체중' },
  { what: '방문 횟수', how: '모래보다 1kg 넘게 무거워졌다가 돌아온 횟수', why: '자주 들락거림' },
  { what: '소변 횟수·양', how: '나온 뒤 모래 무게 − 들어가기 전 모래 무게, 한 번 길게 멈춘 자세면 소변', why: '소변이 늘거나 안 나옴' },
  { what: '대변 횟수', how: '모래 무게가 늘었고, 멈췄다 힘주기를 반복한 자세', why: '대변이 줆' },
  { what: '머문 시간', how: '들어온 시각부터 나간 시각까지', why: '오래 버팀 · 다묘 구분 보조' },
];

const CHANGES: { kind: string; signal: string; window: string; message: string; urgent?: boolean }[] = [
  {
    kind: '급한 변화',
    signal: '6시간에 4번 넘게 들어갔는데 모래 무게가 거의 늘지 않음 · 평소 하루 두 번 보던 소변 기록이 36시간 없음',
    window: '시간 단위',
    message: '"소변이 안 나오는 상태일 수 있어요. 지금 동물병원에 연락해 보세요." 수컷이면 서두르라고 덧붙인다.',
    urgent: true,
  },
  {
    kind: '느린 변화',
    signal: '소변 횟수·양이 몇 주에 걸쳐 늚',
    window: '주 단위',
    message: '"평소보다 소변이 n% 많아요. 검진을 받아 볼 때입니다." 소변이 느는 원인은 여럿이라 병 이름은 말하지 않는다.',
  },
  {
    kind: '느린 변화',
    signal: '체중이 천천히 빠짐',
    window: '주 단위',
    message: '"최근 7일 체중이 평소보다 n% 적어요. 검진을 받아 볼 때입니다."',
  },
  {
    kind: '느린 변화',
    signal: '대변 횟수가 줆',
    window: '주 단위',
    message: '"대변 횟수가 평소보다 줄었어요. 검진을 받아 볼 때입니다."',
  },
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

const RISKS: { risk: string; answer: string }[] = [
  {
    risk: '진단처럼 보이는 표현',
    answer: '수의사법은 수의사가 아닌 사람의 진료를 금지한다. 화면·알림·리포트에 병 이름을 결론으로 쓰지 않고 "행동 변화 알림"과 "검진 권유"만 쓴다. 리포트 첫머리에 "진단이 아닙니다"를 넣는다.',
  },
  { risk: '틀린 알림', answer: '엉뚱한 알림이 잦으면 보호자가 끈다. 기준선 기간·문턱값을 시뮬레이션으로 먼저 고르고, 자원 가구 데이터와 수의사 의견으로 다시 맞춘다.' },
  { risk: '놓친 알림', answer: '"알림이 없으니 괜찮다"로 읽히지 않게, 이 기기가 보지 못하는 것(물 마신 양, 화장실 밖 소변)을 앱에 적어 둔다.' },
  { risk: '데이터', answer: '무게 기록만 모은다. 원신호는 보호자 계정에만 두고, 연구에 쓸 때는 따로 동의를 받는다.' },
  { risk: '경쟁', answer: '큰 회사 제품이 이미 있다. 노령묘·다묘·병원 리포트라는 좁은 쓰임에서 먼저 쓸모를 보인다.' },
];

const ROADMAP: { step: string; detail: string; now?: boolean }[] = [
  { step: '시뮬레이터 + 알고리즘 웹 데모', detail: '무게 신호 생성 → 방문 검출 → 고양이 구분 → 기준선·알림 → 리포트. 이 페이지의 데모.', now: true },
  { step: '저울 시제품', detail: '로드셀 4개·HX711·ESP32로 판을 만들고, 모래·물병으로 g 단위 정확도를 잰다.' },
  { step: '자원 가구 파일럿', detail: '9살 넘은 고양이를 키우는 집 몇 곳에서 4~8주. 카메라로 정답을 붙여 방문 검출·종류·구분 정확도를 잰다.' },
  { step: '보호소·다묘 가구', detail: '체중이 비슷한 고양이 여럿이 화장실 하나를 쓰는 환경에서 구분 성능을 본다.' },
  { step: '수의사와 문턱값 정하기', detail: '어느 정도 바뀌면 검진을 권할지, 리포트에 무엇을 넣을지 동물병원과 맞춘다.' },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }): JSX.Element {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <h2
        id={`${id}-title`}
        className="text-[22px] sm:text-[24px] font-semibold leading-tight mb-5"
        style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)' }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

const P = 'text-[17px] leading-[1.75] max-w-[62ch]';
const LABEL = 'text-[12.5px] tracking-[.03em]';
const TH = `text-left font-normal py-2 pr-3 ${LABEL}`;
const MONO_MUTED = { fontFamily: 'var(--font-mono)', color: 'var(--muted)' } as const;

export default function SeniorCatPage(): JSX.Element {
  return (
    <main style={{ background: 'var(--paper)' }}>
      <article className="max-w-[720px] mx-auto px-5 sm:px-6 pt-14 sm:pt-20 pb-20">
        <Link href="/portfolio" className="inline-flex items-center gap-1 text-[14px] mb-10 underline-offset-4 hover:underline" style={{ color: 'var(--muted)' }}>
          <span aria-hidden="true">←</span> 전체 프로젝트 보기
        </Link>

        <header className="mb-14">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4">
            <span className={LABEL} style={MONO_MUTED}>
              졸업작품 구상
            </span>
            <span className={`inline-flex items-center gap-1.5 ${LABEL}`} style={MONO_MUTED}>
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--muted)' }} />
              구상 · 웹 데모
            </span>
          </div>
          <h1
            className="text-[32px] sm:text-[40px] font-bold leading-[1.2] mb-6"
            style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)', textWrap: 'balance' }}
          >
            노령묘 화장실 무게 센서
          </h1>
          <p className="intro-p text-[19px] leading-[1.7] max-w-[56ch] mb-8" style={{ color: 'var(--ink)' }}>
            화장실 밑 저울이 체중·방문 횟수·소변량·머문 시간을 매일 적고, 그 고양이의 평소에서 벗어나면 &ldquo;검진 받아 볼 때&rdquo;라고 알려 준다.
          </p>

          <dl className="m-0 grid gap-x-8 gap-y-3 sm:grid-cols-[auto_1fr] py-5 text-[15px]" style={{ borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
            <Row label="대상">9살 넘은 고양이를 키우고, 검진은 1년에 1~2번인 1~2인 가구</Row>
            <Row label="형태">쓰던 화장실 밑에 까는 무게 판 + 폰 알림 + 병원 리포트</Row>
            <Row label="하는 일">행동 변화 알림 · 검진 권유 (진단하지 않는다)</Row>
            <Row label="지금">시뮬레이터와 알고리즘 웹 데모 (2026-11)</Row>
          </dl>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/portfolio/senior-cat/demo" className="btn btn-primary">
              시뮬레이터 데모 열기 <span aria-hidden="true">→</span>
            </Link>
            <a href="#research" className="btn btn-ghost">
              연구 질문 보기
            </a>
          </div>
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-14 sm:gap-16">
          <Section id="problem" title="대상과 문제">
            <div className="grid gap-4">
              <p className={P} style={{ color: 'var(--ink)' }}>
                나이 든 고양이의 병은 조용히 온다. 보호자가 눈치챌 즈음엔 이미 꽤 진행된 경우가 많고, 검진은 1년에 한두 번이다. 그 사이의 매일을 보는
                사람이 없다. 그런데 고양이는 하루에도 몇 번씩 같은 자리, 화장실에 간다.
              </p>
              <p className={P} style={{ color: 'var(--ink)' }}>
                그래서 화장실 밑에 저울을 둔다. 병을 알아맞히려는 게 아니라, <b>그 고양이의 평소</b>를 기록해 두었다가 달라지면 &ldquo;병원에 가 볼
                때&rdquo;라고 알리는 것이 목표다.
              </p>
            </div>
            <ul className="mt-8 m-0 p-0 list-none grid gap-4" aria-label="근거">
              {FACTS.map((f) => (
                <li key={f.claim} className="pl-4 grid gap-1" style={{ borderLeft: '1px solid var(--rule)' }}>
                  <p className="text-[16px] leading-[1.7]" style={{ color: 'var(--ink)' }}>
                    {f.claim}
                  </p>
                  <p className="text-[13.5px] leading-[1.55]" style={{ color: 'var(--muted)' }}>
                    <a href={f.href} className="link-u" target="_blank" rel="noopener noreferrer">
                      {f.source}
                    </a>
                    <span aria-hidden="true"> · </span>
                    {f.status}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[15px] leading-[1.7] max-w-[62ch]" style={{ color: 'var(--ink-2)' }}>
              국내 반려묘 수와 노령묘 진료 통계도 찾았지만 원문을 열어 확인하지 못해 싣지 않았다. 위 연구는 기기를 만든 회사가 쓴 것이고 CKD 고양이가
              20마리뿐이라, 이 구상의 근거는 &ldquo;화장실 행동에 신호가 있다&rdquo;까지만이다.
            </p>
          </Section>

          <Section id="measure" title="무엇을 재나">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[15px] leading-[1.6]">
                <caption className="sr-only">측정값과 재는 방법</caption>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--ink-2)' }}>
                    <th scope="col" className={`${TH} w-[22%]`} style={MONO_MUTED}>
                      측정값
                    </th>
                    <th scope="col" className={TH} style={MONO_MUTED}>
                      재는 방법
                    </th>
                    <th scope="col" className={`${TH} w-[24%]`} style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                      보는 변화
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MEASURES.map((m) => (
                    <tr key={m.what} style={{ borderBottom: '1px solid var(--rule)' }}>
                      <th scope="row" className="text-left align-top py-3 pr-3 font-semibold" style={{ color: 'var(--ink)' }}>
                        {m.what}
                      </th>
                      <td className="align-top py-3 pr-3" style={{ color: 'var(--ink-2)' }}>
                        {m.how}
                      </td>
                      <td className="align-top py-3" style={{ color: 'var(--ink)' }}>
                        {m.why}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[15px] leading-[1.7] max-w-[62ch]" style={{ color: 'var(--ink-2)' }}>
              핵심 관찰 하나: 고양이가 안에서 소변을 봐도 저울 위의 총무게는 그대로다. 소변이 몸에서 모래로 옮겨 갈 뿐이다. 그래서 배설량은 고양이가 나간
              뒤 안정된 모래 무게에서 들어가기 전 무게를 빼서 잰다.
            </p>
          </Section>

          <Section id="changes" title="급한 변화와 느린 변화">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[15px] leading-[1.6] min-w-[520px]">
                <caption className="sr-only">알림의 두 종류</caption>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--ink-2)' }}>
                    {['종류', '신호', '시간', '알림 문구'].map((h) => (
                      <th key={h} scope="col" className={TH} style={MONO_MUTED}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CHANGES.map((c) => (
                    <tr key={c.signal} style={{ borderBottom: '1px solid var(--rule)' }}>
                      <th scope="row" className="text-left align-top py-3 pr-3 font-semibold whitespace-nowrap" style={{ color: c.urgent ? 'var(--accent)' : 'var(--ink)' }}>
                        {c.kind}
                      </th>
                      <td className="align-top py-3 pr-3" style={{ color: 'var(--ink)' }}>
                        {c.signal}
                      </td>
                      <td className="align-top py-3 pr-3 whitespace-nowrap" style={{ color: 'var(--ink-2)' }}>
                        {c.window}
                      </td>
                      <td className="align-top py-3" style={{ color: 'var(--ink-2)' }}>
                        {c.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-5 mt-8">
              <Decision what="기준선은 고양이마다 따로">
                처음 몇 주(데모 기본 21일)를 그 고양이의 평소로 삼는다. 다른 고양이 평균이 아니라 자기 자신과 비교한다. 이후엔 최근 7일 평균을 기준선과
                비교하고, 누적합(CUSUM) 변화점 검출로 &ldquo;언제부터 달라졌나&rdquo;를 같이 추정한다.
              </Decision>
              <Decision what="문턱값은 임시값">
                데모의 문턱(급한 변화: 6시간에 배설 없는 방문 4번 · 느린 변화: 7일 평균 ±25% 등)은 시뮬레이션으로 고른 값이다. 실제 값은 수의사 의견과
                자원 가구 데이터로 정한다.
              </Decision>
            </div>
          </Section>

          <Section id="system" title="시스템 구성">
            <SystemDiagram />
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
            <p className="mt-6 text-[15px] leading-[1.7] max-w-[62ch]" style={{ color: 'var(--ink-2)' }}>
              부품값: 미국 소매가로 50kg 하중 센서 4개 US$25, HX711 보드 US$4.95, ESP32 개발 보드 US$15 — 합해 약 US$45다(SparkFun·Adafruit,
              2026-11-04 조회). 국내 호환 부품으로 3~5만 원을 목표로 잡았지만 국내 가격은 아직 확인하지 않았다.
            </p>
          </Section>

          <Section id="research" title="연구 질문과 실험 설계">
            <div className="grid gap-6">
              <Question no="1 · 핵심" title="화장실 하나를 2~3마리가 같이 쓸 때, 체중으로 누가 다녀갔는지 가릴 수 있나?">
                고양이마다 체중 분포를 두고 방문마다 확률을 낸다. 확률이 80%보다 낮으면 억지로 정하지 않고 &ldquo;구분 어려움&rdquo;으로 둔다. 체중에
                머문 시간·방문 시간대를 더하면 얼마나 나아지는지, 체중 차이가 몇 g까지 줄면 무너지는지를 잰다.
              </Question>
              <Question no="2" title="그 고양이의 평소에서 벗어난 걸 며칠 만에 알아채나?">
                변화가 시작된 날부터 알림까지 걸린 날수(검출 지연)와, 아무 일 없을 때 울린 알림 수(엉뚱한 알림)를 같이 본다. 기준선 기간·문턱값을 바꿔
                둘의 균형을 찾는다.
              </Question>
            </div>

            <h3 className="mt-10 mb-3 text-[18px] font-semibold" style={{ color: 'var(--ink)' }}>
              데이터는 이렇게 모은다
            </h3>
            <ol className="m-0 pl-5 grid gap-2 text-[16px] leading-[1.7] max-w-[62ch]" style={{ color: 'var(--ink)' }}>
              <li>자원 가구: 9살 넘은 고양이를 키우는 집에서 4~8주, 저울 기록과 화장실 쪽 카메라(동의한 기간만)로 정답을 붙인다.</li>
              <li>보호소·다묘 가구: 체중이 비슷한 고양이 여럿이 한 화장실을 쓰는 곳에서 구분 성능만 따로 본다.</li>
              <li>아픈 고양이를 일부러 모으거나 병을 맞혔다고 주장하지 않는다. 확인하는 것은 &ldquo;행동 기록이 정확한가&rdquo;와 &ldquo;평소에서 벗어남을 잡는가&rdquo;다.</li>
            </ol>

            <h3 className="mt-10 mb-3 text-[18px] font-semibold" style={{ color: 'var(--ink)' }}>
              시뮬레이터로 먼저 잰 값
            </h3>
            <p className="text-[15.5px] leading-[1.7] max-w-[62ch]" style={{ color: 'var(--ink-2)' }}>
              데모의 시뮬레이터(시드 20개 × 90일)에서 잰 예비 결과다. <b>실제 고양이 데이터가 아니라</b> 시뮬레이터 가정에서만 의미가 있다.
            </p>
            <ul className="mt-3 m-0 p-0 list-none grid gap-2 max-w-[62ch]">
              {[
                '세 마리(3.6·4.2·4.4kg): 방문의 5.5%가 "구분 어려움", 구분한 것 중 97%가 맞음.',
                '기준선을 14일 → 21일로 늘리면 정상 시나리오의 엉뚱한 알림이 100 고양이-일당 0.44 → 0.19로 줄고, 검출 지연은 거의 그대로(15일 → 16일).',
                '소변이 3주에 걸쳐 늘 때 검출까지 중앙값 16일, 체중이 5주에 8% 빠질 때 18일(약 4% 빠진 시점).',
                '소변이 안 나오는 방문이 이어질 때 급한 변화 알림까지 약 2.6시간.',
              ].map((t) => (
                <li key={t} className="pl-4 text-[15px] leading-[1.65]" style={{ borderLeft: '3px solid var(--accent)', color: 'var(--ink)' }}>
                  {t}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="compare" title="경쟁과 차별점">
            <dl className="m-0 grid gap-0" style={{ borderTop: '1px solid var(--rule)' }}>
              {COMPETITORS.map((c) => (
                <div key={c.name} className="grid gap-1 py-4" style={{ borderBottom: '1px solid var(--rule)' }}>
                  <dt className="text-[16px] font-semibold" style={{ color: 'var(--ink)' }}>
                    {c.name}
                  </dt>
                  <dd className="m-0 text-[15.5px] leading-[1.7]" style={{ color: 'var(--ink-2)' }}>
                    {c.what}
                  </dd>
                  <dd className="m-0 text-[15px] leading-[1.7]" style={{ color: 'var(--ink)' }}>
                    {c.gap}
                  </dd>
                </div>
              ))}
            </dl>
            <ul className="mt-6 m-0 p-0 list-none grid gap-2 max-w-[62ch]">
              {[
                '노령묘: 9살 넘은 고양이의 "평소 대비 변화"만 본다. 기능을 늘리지 않는다.',
                '다묘: 구분이 애매한 방문을 숨기지 않고 확률로 나눠 세고, 체중이 비슷하면 미리 알린다.',
                '병원 리포트: 수의사가 1분 안에 읽을 한 쪽 — 평소와 최근 7일 비교, 알림 기록, "진단이 아닙니다".',
              ].map((t) => (
                <li key={t} className="pl-4 text-[15.5px] leading-[1.65]" style={{ borderLeft: '3px solid var(--accent)', color: 'var(--ink)' }}>
                  {t}
                </li>
              ))}
            </ul>
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
                <li key={r.step} className="pl-4 grid gap-0.5" style={{ borderLeft: r.now ? '3px solid var(--accent)' : '1px solid var(--rule)' }}>
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
            시뮬레이터로 해 보기
          </h2>
          <p className="text-[15.5px] leading-[1.7]" style={{ color: 'var(--ink-2)' }}>
            고양이 1~3마리의 체중을 정하고 시나리오를 고른 뒤 날을 넘깁니다. 저울 원신호부터 방문 검출, 고양이 구분, 기준선, 알림, 병원 리포트까지 전부
            브라우저에서 계산합니다.
          </p>
          <div>
            <Link href="/portfolio/senior-cat/demo" className="btn btn-primary">
              데모 열기 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </aside>

        <footer className="mt-16 pt-6 text-[15px] flex justify-between" style={{ borderTop: '1px solid var(--rule)' }}>
          <Link href="/portfolio" className="link-u">
            ← 포트폴리오
          </Link>
          <Link href="/portfolio/senior-cat/demo" className="link-u">
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
      <dt className={`${LABEL} pt-0.5`} style={MONO_MUTED}>
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
