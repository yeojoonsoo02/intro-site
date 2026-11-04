import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { OG_IMAGES, TWITTER_IMAGES } from '@/components/seo/ogMeta';
import CapstoneHero, { AiImageFootnote } from '@/features/capstone/CapstoneHero';
import { CountUp } from '@/features/capstone/motion';
import AiCheckHeroVisual from '@/features/aicheck/HeroVisual';
import FlowDiagram from '@/features/aicheck/FlowDiagram';

// 졸업작품 구상 "이거 AI야?" 설명 페이지. 한국어만 있다(포트폴리오 상세와 같다).
// 데이터 없이 코드에 쓴 정적 페이지라 빌드 때 만들어 둔다. /portfolio/[id]보다 이 정적 경로가 먼저 잡힌다.
// 수치는 출처를 단다. 2차 자료이거나 원문을 못 본 것은 "(확인 필요)", 계획은 "계획"이라고 쓴다 — 결과를 지어내지 않는다.

const URL = `${SITE_URL}/portfolio/ai-check`;
const TITLE = '이거 AI야? SNS 압축에도 버티는 AI 이미지·영상 판별기 — 포트폴리오 | 여준수';
const DESCRIPTION =
  'SNS에서 본 이미지·영상의 AI 표시를 먼저 확인하고, 없으면 내용을 분석해 "AI 표시 확인됨 · AI 의심 N% · 판단 어려움"으로 정직하게 알려 주는 판별기 구상과 웹 데모.';

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

const LEVELS: { level: string; when: string; show: string; never: string; accent?: boolean }[] = [
  {
    level: 'AI 표시 확인됨',
    when: '파일 안에 AI로 만들었다는 표시가 있을 때',
    show: '어디에 무슨 표시가 있는지(C2PA 작업 기록·IPTC 값·워터마크·화면 문구)와 서명 검증 결과',
    never: '서명 없는 표시는 누구나 써넣을 수 있다는 점을 숨기지 않는다',
    accent: true,
  },
  {
    level: 'AI 의심 N%',
    when: '표시는 없고 판별 모델 점수가 기준 이상일 때',
    show: '점수, 모델 이름, 근거 문장(어느 부분이 왜 이상한지), 사본이 얼마나 압축됐는지',
    never: '"가짜"라고 단정하지 않는다',
  },
  {
    level: '판단 어려움',
    when: '그 밖의 모든 경우 — 점수가 낮거나 애매하거나, 너무 압축된 사본',
    show: '왜 판단하지 못했는지(표시 없음, 압축 정도, 학습에 없던 종류일 가능성)',
    never: '"사람이 만들었다"고 말하지 않는다',
  },
];

const PLANNED: { compare: string; data: string; metric: string }[] = [
  {
    compare: '공개 판별기: 원본 파일 vs 플랫폼 왕복 사본',
    data: '공개 데이터셋 + 인스타그램·유튜브 쇼츠·틱톡에 올렸다 다시 받은 사본',
    metric: 'AUC, 오탐률 5%에서의 탐지율',
  },
  {
    compare: '기준선 vs 압축 인식 학습(SNS 압축을 흉내 내 미세조정)',
    data: '같은 왕복 사본(학습에는 쓰지 않음)',
    metric: '같은 지표, 플랫폼별로 따로',
  },
  {
    compare: '흉내 낸 압축으로 학습 vs 실제 왕복 사본으로 학습',
    data: '얼굴 영상에서 보고된 결과(arXiv 2508.08765)가 일반 이미지에도 맞는지',
    metric: '두 학습의 성능 차이',
  },
  {
    compare: '플랫폼별 표시 생존율',
    data: 'C2PA·IPTC·보이지 않는 워터마크·보이는 문구를 넣은 파일을 올렸다 다시 받기',
    metric: '표시별·플랫폼별로 살아남은 비율',
  },
  {
    compare: '3단계 출력의 오탐',
    data: '사람이 찍은 사진의 왕복 사본',
    metric: '"AI 의심"으로 말한 비율(상한을 먼저 정하고 기준값을 맞춤)',
  },
];

const OPEN_SOURCE: { role: string; pick: string; license: string; note: string }[] = [
  { role: 'C2PA 판독', pick: 'c2pa-rs · c2patool · c2pa-web', license: 'MIT (c2pa-web 확인) · c2pa-rs는 확인 필요', note: '데모에서 c2pa-web을 브라우저로 씀' },
  { role: '보이지 않는 워터마크', pick: 'Meta Video Seal · Audio Seal, Adobe TrustMark', license: 'Meta는 MIT · TrustMark 확인 필요', note: '구글 SynthID 탐지기는 공개되지 않아 쓸 수 없음' },
  { role: '이미지 판별 기준선', pick: 'UniversalFakeDetect(CVPR 2023) · DIRE(ICCV 2023) · NPR(CVPR 2024)', license: '확인 필요', note: '비교 실험의 출발점' },
  { role: '이미지 판별 (데모)', pick: 'Community Forensics ViT-S(CVPR 2025)', license: 'MIT', note: '생성기 4,803개 · 270만 장으로 학습. 데모에서 브라우저로 실행' },
  { role: '영상 판별', pick: 'DeMamba/GenVideo · AIGVDet', license: '확인 필요', note: '영상 확장 단계' },
  { role: '얼굴 딥페이크', pick: 'DeepfakeBench', license: '확인 필요', note: '도용 광고(C 확장)에 필요' },
  { role: '근거 문장', pick: 'Qwen-VL · Gemma 계열 VLM', license: '모델마다 다름 (확인 필요)', note: '점수에 "왜"를 붙이는 역할' },
  { role: '브라우저 실행', pick: 'onnxruntime-web', license: 'MIT', note: '서버 없이 판별' },
];

const RISKS: { risk: string; answer: string }[] = [
  { risk: '오탐', answer: '사람이 만든 것을 AI라고 하면 그 사람이 피해를 본다. "가짜"라는 말을 쓰지 않고, 애매하면 "판단 어려움"을 보여 준다. 기준값은 오탐 상한을 먼저 정하고 맞춘다.' },
  { risk: '표시 위조', answer: '서명 없는 표시(XMP·EXIF)는 누구나 지우고 써넣을 수 있다. 그런 표시는 근거로 보여 주되 C2PA 서명과 구분해서 쓴다.' },
  { risk: 'SNS 수집 약관', answer: '데이터는 직접 만든 시험 계정으로 올리고 다시 받은 것만 쓴다. 남의 게시물을 긁어 오지 않는다. 플랫폼별 약관 허용 범위는 확인 필요.' },
  { risk: '새 생성기', answer: '학습에 없던 생성기는 점수가 낮게 나오기 쉽다. 그래서 낮은 점수를 "사람이 만들었다"로 읽지 않게 화면 문구로 막는다.' },
  { risk: '규제 변화', answer: 'AI 기본법 하위 규정과 계도 기간 이후 기준이 바뀔 수 있다. 표시 확인 규칙을 코드 한 곳에 모아 바꾸기 쉽게 둔다.' },
];

const ROADMAP: { step: string; detail: string; now?: boolean }[] = [
  { step: '이미지 웹 데모', detail: '표시 확인 + 판별 모델 + 압축 실험. 이 페이지의 데모.', now: true },
  { step: '플랫폼 왕복 데이터셋', detail: '시험 계정으로 올렸다 다시 받아, 표시 생존율과 기준선 성능을 잰다.' },
  { step: '압축 인식 학습', detail: 'SNS 압축을 흉내 내 미세조정하고 왕복 사본으로 비교한다.' },
  { step: '근거 문장', detail: 'VLM이 점수에 "어디가 왜"를 붙인다.' },
  { step: '영상으로 확장', detail: '같은 2단계 구조를 쇼츠·릴스 길이의 영상에 적용한다.' },
  { step: '브랜드 감시 (C 확장)', detail: '도용 딥페이크 광고 감시. 공식 API와 사용자 신고로만.' },
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
const TH = `text-left font-normal py-2 pr-3 ${LABEL}`;

export default function AiCheckPage(): JSX.Element {
  return (
    <main className="cap cap-aicheck" style={{ background: 'var(--paper)' }}>
      <div className="max-w-[1080px] mx-auto px-5 sm:px-6 pt-12 sm:pt-16">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1 text-[14px] mb-8 underline-offset-4 hover:underline"
          style={{ color: 'var(--muted)' }}
        >
          <span aria-hidden="true">←</span> 전체 프로젝트 보기
        </Link>
        <CapstoneHero
          title="이거 AI야?"
          subtitle="SNS 압축에도 버티는 AI 이미지·영상 판별기"
          concept={
            <>
              AI 표시가 있는지 먼저 확인하고, 없으면 내용을 분석해 &ldquo;AI 표시 확인됨 · AI 의심 N% · 판단 어려움&rdquo; 셋 중 하나로 정직하게 알려 준다.
            </>
          }
          visual={<AiCheckHeroVisual />}
          stats={[
            { value: <CountUp to={4803} />, unit: '개', label: '데모 판별 모델이 학습한 생성기 수 (이미지 270만 장)', source: 'Community Forensics · CVPR 2025' },
            { value: <CountUp to={3} />, unit: '가지', label: '결과는 셋뿐: AI 표시 확인됨 · AI 의심 N% · 판단 어려움', source: '"가짜"라고 단정하지 않는다' },
          ]}
          actions={
            <>
              <Link href="/portfolio/ai-check/demo" className="btn btn-primary">
                웹 데모 열기 <span aria-hidden="true">→</span>
              </Link>
              <a href="#research" className="btn btn-ghost">
                연구 문제 보기
              </a>
            </>
          }
        />
      </div>
      <article className="max-w-[720px] mx-auto px-5 sm:px-6 pb-20">
        <dl
          aria-label="한눈에"
          className="m-0 mb-14 grid gap-x-8 gap-y-3 sm:grid-cols-[auto_1fr] py-5 text-[15px]"
          style={{ borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}
        >
          <Row label="대상">SNS에서 이미지·영상을 보는 일반 사용자</Row>
          <Row label="형태">공유하면 결과를 돌려주는 웹앱 (브라우저 안에서 판별)</Row>
          <Row label="핵심 기술">표시 확인(C2PA·워터마크) + SNS 압축에 강한 내용 판별</Row>
          <Row label="지금">이미지 웹 데모 — 실제 판별 모델이 브라우저에서 돈다 (2026-11)</Row>
        </dl>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-14 sm:gap-16">
          <Section id="who" title="누가, 왜 지금">
            <div className="grid gap-4">
              <p className={P} style={{ color: 'var(--ink)' }}>
                대상은 <b>SNS를 보는 일반 사용자</b>다. 피드에서 본 사진이나 쇼츠가 AI로 만든 건지 궁금해도, 지금은 확인할 방법이 마땅치 않다. 만드는
                쪽에는 표시 의무가 생기고 있지만, 보는 쪽이 그 표시를 확인할 도구는 없다.
              </p>
              <ul className="m-0 p-0 list-none grid gap-2 max-w-[62ch]">
                <li className="pl-4 text-[15.5px] leading-[1.7]" style={{ borderLeft: '3px solid var(--accent)', color: 'var(--ink)' }}>
                  <b>AI 기본법</b>이 2026-01-22에 시행됐다. 생성물 표시 의무가 들어 있고, 주 대상은 AI 사업자이며 1년 이상 계도 기간을 둔다고 알려져
                  있다(2차 자료, 확인 필요).
                </li>
                <li className="pl-4 text-[15.5px] leading-[1.7]" style={{ borderLeft: '3px solid var(--accent)', color: 'var(--ink)' }}>
                  <b>공정위 추천·보증 심사지침</b>이 2026-06-01부터 적용돼, AI 가상인물이 광고하면 인물 가까이에 &ldquo;가상인물&rdquo;을 표시해야
                  한다(2차 자료, 확인 필요).
                </li>
              </ul>
              <p className={P} style={{ color: 'var(--ink)' }}>
                문제는 표시가 SNS를 거치며 사라진다는 점이다. 플랫폼이 업로드 때 C2PA 같은 메타데이터를 지우는 경우가 많다는 보도가 있다(2차 자료,
                플랫폼별로는 확인 필요 — 이것도 이 연구에서 잰다). 그래서 표시만 보는 도구로는 부족하고, 표시가 없을 때 그림 자체를 봐야 한다.
              </p>
            </div>
          </Section>

          <Section id="layers" title="두 단계 판별">
            <FlowDiagram />
            <div className="grid gap-5 mt-8">
              <Decision what="1단계 · 표시 확인 — 확실한 쪽">
                C2PA 출처 정보(OpenAI·Adobe 등이 넣는 서명된 작업 기록), 보이지 않는 워터마크(Meta Video Seal·Audio Seal, Adobe TrustMark), 화면 속
                &ldquo;AI 생성&rdquo; 문구(글자 인식)를 본다. 있으면 그대로 보여 주면 된다. 한계: 표시가 없다고 사람이 만든 것은 아니고, 구글 SynthID의
                탐지기는 공개되지 않아 쓸 수 없다.
              </Decision>
              <Decision what="2단계 · 내용 판별 — 확률 쪽">
                표시가 없을 때만 그림 자체를 본다. 오픈소스 판별 모델이 점수를 내고, VLM이 &ldquo;어디가 왜 이상한지&rdquo; 근거 문장을 붙인다. 이
                연구의 기여는 이 모델을 <b>SNS 압축에 강하게</b> 만드는 것이다.
              </Decision>
            </div>
          </Section>

          <Section id="levels" title="결과는 세 가지로만">
            <p className={`${P} mb-5`} style={{ color: 'var(--ink)' }}>
              판별기가 틀리면 사람이 다친다. 그래서 출력 칸을 먼저 정했다. &ldquo;가짜&rdquo;나 &ldquo;진짜&rdquo;라는 칸은 없다.
            </p>
            <dl className="m-0 grid gap-0" style={{ borderTop: '1px solid var(--rule)' }}>
              {LEVELS.map((l) => (
                <div key={l.level} className="grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6 py-4" style={{ borderBottom: '1px solid var(--rule)' }}>
                  <dt className="text-[16px] font-semibold" style={{ color: l.accent ? 'var(--accent)' : 'var(--ink)' }}>
                    {l.level}
                  </dt>
                  <dd className="m-0 grid gap-1 text-[15.5px] leading-[1.65]" style={{ color: 'var(--ink-2)' }}>
                    <span>
                      <span className="meta mr-2">언제</span>
                      {l.when}
                    </span>
                    <span>
                      <span className="meta mr-2">보여 줌</span>
                      {l.show}
                    </span>
                    <span>
                      <span className="meta mr-2">안 함</span>
                      {l.never}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section id="research" title="연구 문제와 실험 설계">
            <div className="grid gap-4">
              <p className={P} style={{ color: 'var(--ink)' }}>
                판별 모델은 <b>깨끗한 원본 파일</b>에서는 잘 맞는다. 영상 판별 벤치마크 AIGVDBench에서 AUC 95.28이 보고됐다(arXiv 2607.15321). 그런데
                SNS에 올라간 사본은 줄이고 다시 압축한 파일이다.
              </p>
              <ul className="m-0 pl-5 grid gap-2 text-[15.5px] leading-[1.7] max-w-[62ch]" style={{ color: 'var(--ink)' }}>
                <li>
                  SAFE 챌린지(ICCV 2025 워크숍) 보고서는 생성기를 넘나드는 일반화는 나아졌지만, 크기 조정·재압축 같은 후처리에는 여전히 약하다고 정리했다
                  (arXiv 2605.06912).
                </li>
                <li>
                  압축된 비트스트림을 풀지 않고 코덱의 움직임 정보만 읽는 가벼운 판별 단계는 GenVidBench에서 AUC 0.64에 그쳤다(arXiv 2607.19476). 압축 파일
                  자체에서 신호를 얻기가 아직 어렵다는 뜻으로 읽는다.
                </li>
                <li>
                  얼굴 딥페이크 영상에서는, 플랫폼 압축을 흉내 내 미세조정한 판별기가 실제로 공유된 사본으로 학습한 것과 비슷한 성능을 냈다(arXiv
                  2508.08765). 일반 이미지·영상에서도 그런지는 아직 모른다.
                </li>
              </ul>
              <p className={P} style={{ color: 'var(--ink)' }}>
                그래서 질문은 이렇다. <b>SNS 압축을 흉내 내 학습한 판별기가, 실제로 인스타그램·유튜브 쇼츠·틱톡에 올렸다 다시 받은 사본에서도 버티는가?</b>{' '}
                그리고 플랫폼마다 표시(C2PA·IPTC·워터마크)는 얼마나 살아남는가?
              </p>
            </div>

            <h3 className="mt-10 mb-3 text-[18px] font-semibold" style={{ color: 'var(--ink)' }}>
              계획한 비교 <span className="meta ml-1">결과 없음 · 계획</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[15px] leading-[1.6]">
                <caption className="sr-only">계획한 비교 실험 (아직 결과 없음)</caption>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--ink-2)' }}>
                    <th scope="col" className={`${TH} w-[34%]`} style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                      비교
                    </th>
                    <th scope="col" className={`${TH} w-[38%]`} style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                      데이터
                    </th>
                    <th scope="col" className={TH} style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                      지표
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PLANNED.map((r) => (
                    <tr key={r.compare} style={{ borderBottom: '1px solid var(--rule)' }}>
                      <th scope="row" className="text-left align-top py-3 pr-3 font-semibold" style={{ color: 'var(--ink)' }}>
                        {r.compare}
                      </th>
                      <td className="align-top py-3 pr-3" style={{ color: 'var(--ink-2)' }}>
                        {r.data}
                      </td>
                      <td className="align-top py-3" style={{ color: 'var(--ink-2)' }}>
                        {r.metric}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[15px] leading-[1.7] max-w-[62ch]" style={{ color: 'var(--ink-2)' }}>
              데이터는 공개 데이터셋(GenVidBench 등)을 쓰고, 직접 만들어야 하는 AI 샘플은 내 맥의 오픈소스 로컬 모델로만 만든다. 유료 생성 API는 쓰지
              않는다. 플랫폼 업로드는 직접 만든 시험 계정으로 한다.
            </p>

            <h3 className="mt-10 mb-3 text-[18px] font-semibold" style={{ color: 'var(--ink)' }}>
              데모 모델로 해 본 예비 확인 <span className="meta ml-1">4장 · 통계 아님</span>
            </h3>
            <p className={P} style={{ color: 'var(--ink)' }}>
              데모에 넣은 판별 모델을 파이썬 onnxruntime으로 돌려, 로컬 오픈소스 모델(Z-Image Turbo)로 만든 그림 3장과 사람이 찍은 사진 1장을 봤다.
              AI 그림 하나는 원본에서 99.8%였는데, 긴 변 1080px · JPEG 품질 85로 다시 저장하자 8.2%로 떨어졌다. 다른 하나는 99.8% → 99.3%로 버텼고,
              나머지 하나는 원본부터 24.0%로 놓쳤다. 사진은 0.2%였다. 장수가 적어 결론이 아니라, 이 연구가 무엇을 재야 하는지 보여 주는 예시다.
            </p>
          </Section>

          <Section id="stack" title="오픈소스 구성">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[15px] leading-[1.6] min-w-[560px]">
                <caption className="sr-only">역할별 오픈소스 후보와 라이선스</caption>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--ink-2)' }}>
                    <th scope="col" className={`${TH} w-[20%]`} style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                      역할
                    </th>
                    <th scope="col" className={`${TH} w-[34%]`} style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                      후보
                    </th>
                    <th scope="col" className={`${TH} w-[18%]`} style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                      라이선스
                    </th>
                    <th scope="col" className={TH} style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                      비고
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {OPEN_SOURCE.map((r) => (
                    <tr key={r.role} style={{ borderBottom: '1px solid var(--rule)' }}>
                      <th scope="row" className="text-left align-top py-3 pr-3 font-semibold" style={{ color: 'var(--ink)' }}>
                        {r.role}
                      </th>
                      <td className="align-top py-3 pr-3" style={{ color: 'var(--ink)' }}>
                        {r.pick}
                      </td>
                      <td className="align-top py-3 pr-3" style={{ color: 'var(--ink-2)' }}>
                        {r.license}
                      </td>
                      <td className="align-top py-3" style={{ color: 'var(--ink-2)' }}>
                        {r.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="extension" title="확장: 브랜드·기획사의 도용 광고 감시">
            <div className="grid gap-4">
              <p className={P} style={{ color: 'var(--ink)' }}>
                같은 엔진으로 <b>브랜드·연예기획사</b>가 자기 모델이나 소속 연예인 얼굴을 도용한 딥페이크 광고를 찾게 할 수 있다. 돈을 낼 쪽이 분명한
                확장이다.
              </p>
              <p className={P} style={{ color: 'var(--ink)' }}>
                다만 나중에 한다. SNS를 대신 긁어 오는 건 플랫폼 약관에 걸리고, 남의 게시물을 &ldquo;도용&rdquo;이라고 지목했다가 틀리면 책임이 생긴다.
                그래서 확장하더라도 <b>공식 API</b>와 <b>사용자가 직접 보낸 신고</b>로만 받고, 결과는 여기서와 같은 3단계로만 말한다.
              </p>
            </div>
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
            내 이미지로 해 보기
          </h2>
          <p className="text-[15.5px] leading-[1.7]" style={{ color: 'var(--ink-2)' }}>
            이미지를 넣으면 C2PA·IPTC 표시를 확인하고, 판별 모델이 브라우저 안에서 점수를 매깁니다. 압축 실험에서 SNS처럼 줄여 보면 표시가 사라지고
            점수가 바뀌는 걸 직접 볼 수 있습니다. 파일은 어디에도 올라가지 않습니다.
          </p>
          <div>
            <Link href="/portfolio/ai-check/demo" className="btn btn-primary">
              데모 열기 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </aside>

        <footer className="mt-16 pt-6 text-[15px] flex justify-between" style={{ borderTop: '1px solid var(--rule)' }}>
          <Link href="/portfolio" className="link-u">
            ← 포트폴리오
          </Link>
          <Link href="/portfolio/ai-check/demo" className="link-u">
            데모 →
          </Link>
        </footer>
        <AiImageFootnote />
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
