import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { OG_IMAGES, TWITTER_IMAGES } from '@/components/seo/ogMeta';
import { CountUp, MotionScope } from '@/features/capstone/motion';
import AiCheckHeroVisual from '@/features/aicheck/HeroVisual';
import FlowDiagram from '@/features/aicheck/FlowDiagram';
import { AiImageFootnote, Exhibit, Flag, More, ScrollTable, Tag } from '@/features/aicheck/LabParts';
import '@/features/aicheck/lab.css';

// 졸업작품 구상 "이거 AI야?" 설명 페이지. 한국어만 있다(포트폴리오 상세와 같다).
// 데이터 없이 코드에 쓴 정적 페이지라 빌드 때 만들어 둔다. /portfolio/[id]보다 이 정적 경로가 먼저 잡힌다.
// 수치는 출처를 단다. 2차 자료이거나 원문을 못 본 것은 "(확인 필요)", 계획은 "계획"이라고 쓴다 — 결과를 지어내지 않는다.
// 모양: 어두운 검사 콘솔 위의 감식 보고서. 증거 카드마다 사건 번호를 달고, 표·인용·실험 세부는 접어 둔다(lab.css).

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

const DEMO = '/portfolio/ai-check/demo';

const LEVELS: { code: string; level: string; when: string; show: string; never: string; accent?: boolean }[] = [
  {
    code: 'OUT-1',
    level: 'AI 표시 확인됨',
    when: '파일 안에 AI로 만들었다는 표시가 있을 때',
    show: '어디에 무슨 표시가 있는지(C2PA 작업 기록·IPTC 값·워터마크·화면 문구)와 서명 검증 결과',
    never: '서명 없는 표시는 누구나 써넣을 수 있다는 점을 숨기지 않는다',
    accent: true,
  },
  {
    code: 'OUT-2',
    level: 'AI 의심 N%',
    when: '표시는 없고 판별 모델 점수가 기준 이상일 때',
    show: '점수, 모델 이름, 근거 문장(어느 부분이 왜 이상한지), 사본이 얼마나 압축됐는지',
    never: '"가짜"라고 단정하지 않는다',
  },
  {
    code: 'OUT-3',
    level: '판단 어려움',
    when: '그 밖의 모든 경우 — 점수가 낮거나 애매하거나, 너무 압축된 사본',
    show: '왜 판단하지 못했는지(표시 없음, 압축 정도, 학습에 없던 종류일 가능성)',
    never: '"사람이 만들었다"고 말하지 않는다',
  },
];

// 예비 확인 4장(데모 모델 · 파이썬 onnxruntime). 재저장 = 긴 변 1080px · JPEG 품질 85. 본문 문장의 값 그대로.
const PRELIM: { id: string; what: string; orig: number; resaved?: number; note: string; amber?: boolean }[] = [
  { id: 'AI-1', what: 'AI 그림', orig: 99.8, resaved: 8.2, note: '다시 저장하자 떨어짐', amber: true },
  { id: 'AI-2', what: 'AI 그림', orig: 99.8, resaved: 99.3, note: '버팀' },
  { id: 'AI-3', what: 'AI 그림', orig: 24.0, note: '원본부터 놓침', amber: true },
  { id: 'PH-1', what: '사람이 찍은 사진', orig: 0.2, note: '' },
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

const OPEN_SOURCE: { role: string; pick: string; license: string; note: string; demo?: boolean }[] = [
  { role: 'C2PA 판독', pick: 'c2pa-rs · c2patool · c2pa-web', license: 'MIT (c2pa-web 확인) · c2pa-rs는 확인 필요', note: '데모에서 c2pa-web을 브라우저로 씀', demo: true },
  { role: '보이지 않는 워터마크', pick: 'Meta Video Seal · Audio Seal, Adobe TrustMark', license: 'Meta는 MIT · TrustMark 확인 필요', note: '구글 SynthID 탐지기는 공개되지 않아 쓸 수 없음' },
  { role: '이미지 판별 기준선', pick: 'UniversalFakeDetect(CVPR 2023) · DIRE(ICCV 2023) · NPR(CVPR 2024)', license: '확인 필요', note: '비교 실험의 출발점' },
  { role: '이미지 판별 (데모)', pick: 'Community Forensics ViT-S(CVPR 2025)', license: 'MIT', note: '생성기 4,803개 · 270만 장으로 학습. 데모에서 브라우저로 실행', demo: true },
  { role: '영상 판별', pick: 'DeMamba/GenVideo · AIGVDet', license: '확인 필요', note: '영상 확장 단계' },
  { role: '얼굴 딥페이크', pick: 'DeepfakeBench', license: '확인 필요', note: '도용 광고(C 확장)에 필요' },
  { role: '근거 문장', pick: 'Qwen-VL · Gemma 계열 VLM', license: '모델마다 다름 (확인 필요)', note: '점수에 "왜"를 붙이는 역할' },
  { role: '브라우저 실행', pick: 'onnxruntime-web', license: 'MIT', note: '서버 없이 판별', demo: true },
];

const RISKS: { risk: string; answer: string }[] = [
  { risk: '오탐', answer: '사람이 만든 것을 AI라고 하면 그 사람이 피해를 본다. "가짜"라는 말을 쓰지 않고, 애매하면 "판단 어려움"을 보여 준다. 기준값은 오탐 상한을 먼저 정하고 맞춘다.' },
  { risk: '표시 위조', answer: '서명 없는 표시(XMP·EXIF)는 누구나 지우고 써넣을 수 있다. 근거로 보여 주되 C2PA 서명과 구분해서 쓴다.' },
  { risk: 'SNS 수집 약관', answer: '직접 만든 시험 계정으로 올리고 다시 받은 것만 쓴다. 남의 게시물을 긁어 오지 않는다. 플랫폼별 약관 허용 범위는 확인 필요.' },
  { risk: '새 생성기', answer: '학습에 없던 생성기는 점수가 낮게 나오기 쉽다. 낮은 점수를 "사람이 만들었다"로 읽지 않게 화면 문구로 막는다.' },
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

const INDEX: { href: string; code: string; label: string }[] = [
  { href: '#exh-a', code: 'A', label: '원본 vs SNS 사본' },
  { href: '#exh-b', code: 'B', label: '표시 확인' },
  { href: '#exh-c', code: 'C', label: '내용 판별' },
  { href: '#rule', code: 'R', label: '판정 규칙' },
  { href: '#plan', code: 'E', label: '실험 계획' },
  { href: '#stack', code: 'S', label: '오픈소스' },
  { href: '#extension', code: 'X', label: '확장' },
  { href: '#risks', code: '!', label: '위험' },
  { href: '#roadmap', code: 'M', label: '로드맵' },
];

const CHECK = 'grid grid-cols-[auto_minmax(0,1fr)] gap-x-2.5 items-baseline';

export default function AiCheckPage(): JSX.Element {
  return (
    <main className="lab">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 pt-12 sm:pt-14 pb-16">
        <Link href="/portfolio" className="lab-mono inline-flex items-center gap-1 text-[13px] mb-7 hover:underline underline-offset-4" style={{ color: 'var(--muted)' }}>
          <span aria-hidden="true">←</span> 전체 프로젝트 보기
        </Link>

        {/* 사건 머리 */}
        <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-7 lg:items-start">
          <div className="min-w-0 lg:pt-2">
            <p className="lab-kicker flex flex-wrap gap-x-3 gap-y-1 m-0 mb-4">
              <span>CASE AIC-2026-11</span>
              <span aria-hidden="true">/</span>
              <span>졸업작품 구상</span>
              <span style={{ color: 'var(--accent)' }}>● 구상 · 웹 데모</span>
            </p>
            <h1 className="m-0 text-[40px] sm:text-[54px] font-extrabold leading-[1.05] tracking-[-0.03em]" style={{ color: 'var(--ink)' }}>
              이거 AI야?
            </h1>
            <p className="mt-3 mb-5 text-[18px] sm:text-[20px] leading-[1.45] font-semibold" style={{ color: 'var(--ink-2)' }}>
              SNS 압축에도 버티는 AI 이미지·영상 판별기
            </p>
            <p className="m-0 text-[16.5px] sm:text-[17px] leading-[1.7] max-w-[46ch]" style={{ color: 'var(--ink)' }}>
              AI 표시가 있는지 먼저 확인하고, 없으면 내용을 분석해 &ldquo;AI 표시 확인됨 · AI 의심 N% · 판단 어려움&rdquo; 셋 중 하나로 정직하게 알려 준다.
            </p>

            <dl className="m-0 mt-6 grid gap-0" style={{ borderTop: '1px solid var(--rule)' }}>
              <Readout
                value={<CountUp to={4803} />}
                unit="개"
                label="데모 판별 모델이 학습한 생성기 수 (이미지 270만 장)"
                source="Community Forensics · CVPR 2025"
              />
              <Readout value={<CountUp to={3} />} unit="가지" label="결과는 셋뿐: AI 표시 확인됨 · AI 의심 N% · 판단 어려움" source='"가짜"라고 단정하지 않는다' />
            </dl>

            <div className="flex flex-wrap gap-3 mt-6">
              <Link href={DEMO} className="btn btn-primary">
                직접 검사해 보기 <span aria-hidden="true">→</span>
              </Link>
              <a href="#evidence" className="btn btn-ghost">
                증거 목록 보기
              </a>
            </div>
          </div>
          <div className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2">
            <AiCheckHeroVisual />
          </div>
          <div className="min-w-0">
            <p className="lab-kicker m-0 mb-1">사건 개요</p>
            <dl aria-label="사건 개요" className="lab-kv text-[15px]">
              <dt>대상</dt>
              <dd>SNS에서 이미지·영상을 보는 일반 사용자</dd>
              <dt>형태</dt>
              <dd>공유하면 결과를 돌려주는 웹앱 (브라우저 안에서 판별)</dd>
              <dt>핵심 기술</dt>
              <dd>표시 확인(C2PA·워터마크) + SNS 압축에 강한 내용 판별</dd>
              <dt>지금</dt>
              <dd>이미지 웹 데모 — 실제 판별 모델이 브라우저에서 돈다 (2026-11)</dd>
            </dl>
          </div>
        </header>

        {/* 왜 지금 */}
        <section aria-labelledby="why-title" className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-10">
          <div className="min-w-0">
            <h2 id="why-title" className="lab-kicker m-0 mb-2">
              배경 · 누가, 왜 지금
            </h2>
            <p className="m-0 text-[15px] leading-[1.7]" style={{ color: 'var(--ink)' }}>
              피드에서 본 사진이나 쇼츠가 AI로 만든 건지 궁금해도, 지금은 확인할 방법이 마땅치 않다. 만드는 쪽에는 표시 의무가 생기고 있지만, 보는 쪽이 그
              표시를 확인할 도구는 없다. 게다가 표시는 SNS를 거치며 사라진다 — 그래서 표시가 없을 때 그림 자체를 봐야 한다.
            </p>
            <More label="근거 원문 보기" count="2차 자료 3건">
              <ul className="m-0 pl-5 grid gap-2 text-[14.5px] leading-[1.65]" style={{ color: 'var(--ink-2)' }}>
                <li>
                  <b style={{ color: 'var(--ink)' }}>AI 기본법</b>이 2026-01-22에 시행됐다. 생성물 표시 의무가 들어 있고, 주 대상은 AI 사업자이며 1년 이상 계도
                  기간을 둔다고 알려져 있다(2차 자료, 확인 필요).
                </li>
                <li>
                  <b style={{ color: 'var(--ink)' }}>공정위 추천·보증 심사지침</b>이 2026-06-01부터 적용돼, AI 가상인물이 광고하면 인물 가까이에
                  &ldquo;가상인물&rdquo;을 표시해야 한다(2차 자료, 확인 필요).
                </li>
                <li>
                  플랫폼이 업로드 때 C2PA 같은 메타데이터를 지우는 경우가 많다는 보도가 있다(2차 자료, 플랫폼별로는 확인 필요 — 이것도 이 연구에서 잰다).
                </li>
              </ul>
            </More>
          </div>
          <div className="min-w-0">
            <p className="lab-kicker m-0 mb-2 flex flex-wrap gap-x-3">
              <span>기록</span>
              <span style={{ color: 'var(--amber)' }}>2차 자료 · 확인 필요</span>
            </p>
            <ol className="m-0 p-0 list-none grid gap-1.5 text-[14px] leading-[1.55]">
              <LogLine when="2026-01-22" what="AI 기본법 시행 — 생성물 표시 의무" />
              <LogLine when="2026-06-01" what="공정위 추천·보증 심사지침 — AI 가상인물 광고에 “가상인물” 표시" />
              <LogLine when="보도" what="플랫폼이 업로드 때 C2PA 같은 메타데이터를 지우는 경우가 많다" />
            </ol>
          </div>
        </section>

        {/* 증거 목록 */}
        <nav aria-label="증거 목록" id="evidence" className="mt-7 scroll-mt-24 py-2" style={{ borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
          <ol className="m-0 p-0 list-none flex flex-wrap gap-x-5 gap-y-1">
            {INDEX.map((x) => (
              <li key={x.href}>
                <a href={x.href} className="lab-mono inline-flex items-center gap-1.5 min-h-[36px] text-[13px] hover:underline underline-offset-4" style={{ color: 'var(--ink-2)' }}>
                  <span style={{ color: 'var(--accent)' }}>{x.code}</span>
                  {x.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-6 grid gap-6 lg:gap-7">
          {/* 증거 B · C */}
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-7">
            <Exhibit id="exh-b" code="EXH-B · 1단계" status={<Tag tone="accent">확실한 쪽</Tag>} title="증거 B — 표시 확인 1단계">
              <p className="m-0 mb-3" style={{ color: 'var(--ink-2)' }}>
                파일이 스스로 밝힌 표시를 먼저 본다. 있으면 그대로 보여 주면 된다.
              </p>
              <ul className="m-0 p-0 list-none grid gap-1.5 mb-4">
                <CheckItem name="C2PA 출처 정보" detail="OpenAI·Adobe 등이 넣는 서명된 작업 기록" />
                <CheckItem name="보이지 않는 워터마크" detail="Meta Video Seal·Audio Seal, Adobe TrustMark" />
                <CheckItem name="화면 속 “AI 생성” 문구" detail="글자 인식" />
              </ul>
              <Flag>표시가 없다고 사람이 만든 것은 아니다. 구글 SynthID의 탐지기는 공개되지 않아 쓸 수 없다.</Flag>
            </Exhibit>

            <Exhibit id="exh-c" code="EXH-C · 2단계" status={<Tag>확률 쪽</Tag>} title="증거 C — 내용 판별 2단계">
              <p className="m-0 mb-3" style={{ color: 'var(--ink-2)' }}>
                표시가 없을 때만 그림 자체를 본다.
              </p>
              <ul className="m-0 p-0 list-none grid gap-1.5 mb-4">
                <CheckItem name="점수" detail="오픈소스 판별 모델" />
                <CheckItem name="근거 문장" detail="VLM이 “어디가 왜 이상한지”를 붙임" />
              </ul>
              <p className="m-0 pl-3 text-[15px]" style={{ borderLeft: '3px solid var(--accent)', color: 'var(--ink)' }}>
                이 연구의 기여는 이 모델을 <b style={{ color: 'var(--accent-strong)' }}>SNS 압축에 강하게</b> 만드는 것이다.
              </p>
            </Exhibit>
          </div>

          {/* 판정 규칙 */}
          <Exhibit id="rule" code="RULE-01 · 출력 규칙" status={<Tag tone="accent">결과는 세 가지로만</Tag>} title="판정 규칙 — 확인됨 / 의심 N% / 판단 어려움">
            <MotionScope className="mb-5">
              <p className="lab-mono m-0 px-3 py-2.5 text-[13.5px] leading-[1.6]" style={{ background: 'var(--paper)', border: '1px solid var(--rule)', color: 'var(--ink)' }}>
                <span style={{ color: 'var(--accent)' }}>&gt;</span> 판별기가 틀리면 사람이 다친다. 그래서 출력 칸을 먼저 정했다 — &ldquo;가짜&rdquo;나 &ldquo;진짜&rdquo;라는 칸은 없다
                <span aria-hidden="true" className="lab-cursor" />
              </p>
            </MotionScope>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-8 lg:items-start">
              <FlowDiagram />
              <ol className="m-0 p-0 list-none grid gap-0" style={{ borderTop: '1px solid var(--rule)' }}>
                {LEVELS.map((l) => (
                  <li key={l.level} className="py-3 grid gap-1" style={{ borderBottom: '1px solid var(--rule)' }}>
                    <p className="m-0 flex items-baseline gap-2.5">
                      <span className="lab-mono text-[11.5px]" style={{ color: 'var(--muted)' }}>
                        {l.code}
                      </span>
                      <b className="text-[16px]" style={{ color: l.accent ? 'var(--accent)' : 'var(--ink)' }}>
                        {l.level}
                      </b>
                    </p>
                    <p className="m-0 grid grid-cols-[3.4rem_minmax(0,1fr)] gap-x-2 !text-[14px] !leading-[1.6]">
                      <span className="lab-mono text-[11.5px] pt-[2px]" style={{ color: 'var(--amber)' }}>
                        안 함
                      </span>
                      <span style={{ color: 'var(--ink)' }}>{l.never}</span>
                    </p>
                  </li>
                ))}
              </ol>
            </div>
            <More label="칸별 조건과 보여 주는 것" count="3칸">
              <ScrollTable label="결과 칸별 조건과 보여 주는 것 표" minWidth={520}>
                <caption className="sr-only">결과 세 칸이 언제 나오고 무엇을 보여 주는지</caption>
                <thead>
                  <tr>
                    <th scope="col" className="w-[18%]">
                      칸
                    </th>
                    <th scope="col" className="w-[34%]">
                      언제
                    </th>
                    <th scope="col">보여 줌</th>
                  </tr>
                </thead>
                <tbody>
                  {LEVELS.map((l) => (
                    <tr key={l.level}>
                      <th scope="row">{l.level}</th>
                      <td>{l.when}</td>
                      <td>{l.show}</td>
                    </tr>
                  ))}
                </tbody>
              </ScrollTable>
            </More>
          </Exhibit>

          {/* 실험 계획 */}
          <Exhibit id="plan" code="EXP-01 · 연구 문제" status={<Tag tone="amber">결과 없음 · 계획</Tag>} title="실험 계획">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
              <div className="min-w-0 grid gap-3 content-start">
                <p className="m-0" style={{ color: 'var(--ink-2)' }}>
                  판별 모델은 깨끗한 원본 파일에서는 잘 맞는다. 그런데 SNS에 올라간 사본은 줄이고 다시 압축한 파일이다. 그래서 질문은 이렇다.
                </p>
                <p className="m-0 pl-3 text-[16px] font-semibold leading-[1.6]" style={{ borderLeft: '3px solid var(--accent)', color: 'var(--ink)' }}>
                  SNS 압축을 흉내 내 학습한 판별기가, 실제로 인스타그램·유튜브 쇼츠·틱톡에 올렸다 다시 받은 사본에서도 버티는가? 그리고 플랫폼마다
                  표시(C2PA·IPTC·워터마크)는 얼마나 살아남는가?
                </p>
                <div>
                  <More label="선행 연구" count="인용 4건">
                    <ul className="m-0 pl-5 grid gap-2 text-[14.5px] leading-[1.65]" style={{ color: 'var(--ink-2)' }}>
                      <li>영상 판별 벤치마크 AIGVDBench에서 AUC 95.28이 보고됐다(arXiv 2607.15321).</li>
                      <li>
                        SAFE 챌린지(ICCV 2025 워크숍) 보고서는 생성기를 넘나드는 일반화는 나아졌지만, 크기 조정·재압축 같은 후처리에는 여전히 약하다고
                        정리했다(arXiv 2605.06912).
                      </li>
                      <li>
                        압축된 비트스트림을 풀지 않고 코덱의 움직임 정보만 읽는 가벼운 판별 단계는 GenVidBench에서 AUC 0.64에 그쳤다(arXiv 2607.19476).
                        압축 파일 자체에서 신호를 얻기가 아직 어렵다는 뜻으로 읽는다.
                      </li>
                      <li>
                        얼굴 딥페이크 영상에서는, 플랫폼 압축을 흉내 내 미세조정한 판별기가 실제로 공유된 사본으로 학습한 것과 비슷한 성능을 냈다(arXiv
                        2508.08765). 일반 이미지·영상에서도 그런지는 아직 모른다.
                      </li>
                    </ul>
                  </More>
                  <More label="계획한 비교" count="5건 · 결과 없음 · 계획">
                    <ScrollTable label="계획한 비교 실험 표" minWidth={520}>
                      <caption className="sr-only">계획한 비교 실험 (아직 결과 없음)</caption>
                      <thead>
                        <tr>
                          <th scope="col" className="w-[34%]">
                            비교
                          </th>
                          <th scope="col" className="w-[38%]">
                            데이터
                          </th>
                          <th scope="col">지표</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PLANNED.map((r) => (
                          <tr key={r.compare}>
                            <th scope="row">{r.compare}</th>
                            <td>{r.data}</td>
                            <td>{r.metric}</td>
                          </tr>
                        ))}
                      </tbody>
                    </ScrollTable>
                    <p className="m-0 mt-3 text-[14px] leading-[1.65]" style={{ color: 'var(--ink-2)' }}>
                      데이터는 공개 데이터셋(GenVidBench 등)을 쓰고, 직접 만들어야 하는 AI 샘플은 내 맥의 오픈소스 로컬 모델로만 만든다. 유료 생성 API는 쓰지
                      않는다. 플랫폼 업로드는 직접 만든 시험 계정으로 한다.
                    </p>
                  </More>
                </div>
              </div>

              <div className="min-w-0">
                <div className="p-4" style={{ background: 'var(--paper)', border: '1px solid var(--rule)' }}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                    <h3 className="m-0">데모 모델로 해 본 예비 확인</h3>
                    <Tag tone="amber">4장 · 통계 아님</Tag>
                  </div>
                  <MotionScope>
                    <table className="w-full border-collapse text-[13px]">
                      <caption className="sr-only">예비 확인 4장의 판별 점수 (AI일 확률, 원본과 다시 저장한 사본)</caption>
                      <thead>
                        <tr className="lab-mono text-[11.5px]" style={{ color: 'var(--muted)' }}>
                          <th scope="col" className="text-left font-normal pb-1.5 pr-2">
                            시료
                          </th>
                          <th scope="col" className="text-left font-normal pb-1.5">
                            원본 → 재저장
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {PRELIM.map((r, i) => (
                          <tr key={r.id} style={{ borderTop: '1px solid var(--rule)' }}>
                            <th scope="row" className="text-left font-normal align-top py-2 pr-3 w-[9.5rem]">
                              <span className="block text-[12px]" style={{ color: 'var(--muted)' }}>
                                <span className="lab-mono text-[12.5px]" style={{ color: 'var(--ink)' }}>
                                  {r.id}
                                </span>{' '}
                                {r.what}
                              </span>
                              <span className="block text-[12px]" style={{ color: r.amber ? 'var(--amber)' : 'var(--muted)' }}>
                                {r.note}
                              </span>
                            </th>
                            <td className="align-top py-2">
                              <Meter label="원본" value={r.orig} delay={0.1 + i * 0.15} />
                              {r.resaved !== undefined && <Meter label="재저장" value={r.resaved} from={r.orig} delay={0.7 + i * 0.15} amber={r.amber} />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </MotionScope>
                  <More label="조건과 해석">
                    <p className="m-0 text-[14px] leading-[1.65]" style={{ color: 'var(--ink-2)' }}>
                      데모에 넣은 판별 모델을 파이썬 onnxruntime으로 돌려, 로컬 오픈소스 모델(Z-Image Turbo)로 만든 그림 3장과 사람이 찍은 사진 1장을 봤다.
                      AI 그림 하나는 원본에서 99.8%였는데, 긴 변 1080px · JPEG 품질 85로 다시 저장하자 8.2%로 떨어졌다. 다른 하나는 99.8% → 99.3%로 버텼고,
                      나머지 하나는 원본부터 24.0%로 놓쳤다. 사진은 0.2%였다. 장수가 적어 결론이 아니라, 이 연구가 무엇을 재야 하는지 보여 주는 예시다.
                    </p>
                  </More>
                </div>
              </div>
            </div>
          </Exhibit>

          {/* 오픈소스 · 확장 */}
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-7">
            <Exhibit id="stack" code="SRC-01 · 구성" status={<Tag>역할 8개</Tag>} title="오픈소스 구성">
              <p className="lab-kicker m-0 mb-2">데모에서 지금 실제로 도는 것</p>
              <ul className="m-0 p-0 list-none grid gap-0 mb-1" style={{ borderTop: '1px solid var(--rule)' }}>
                {OPEN_SOURCE.filter((r) => r.demo).map((r) => (
                  <li key={r.role} className="py-2 grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-baseline" style={{ borderBottom: '1px solid var(--rule)' }}>
                    <span className="!text-[14.5px]">
                      <b style={{ color: 'var(--ink)' }}>{r.role}</b>
                      <span className="block text-[13px]" style={{ color: 'var(--muted)' }}>
                        {r.note}
                      </span>
                    </span>
                    <span className="lab-mono text-[12px]" style={{ color: 'var(--accent)' }}>
                      {r.license === 'MIT' ? 'MIT' : 'MIT (c2pa-web)'}
                    </span>
                  </li>
                ))}
              </ul>
              <More label="역할별 후보와 라이선스 표" count="8행">
                <ScrollTable label="역할별 오픈소스 후보와 라이선스 표" minWidth={560}>
                  <caption className="sr-only">역할별 오픈소스 후보와 라이선스</caption>
                  <thead>
                    <tr>
                      <th scope="col" className="w-[20%]">
                        역할
                      </th>
                      <th scope="col" className="w-[34%]">
                        후보
                      </th>
                      <th scope="col" className="w-[18%]">
                        라이선스
                      </th>
                      <th scope="col">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {OPEN_SOURCE.map((r) => (
                      <tr key={r.role}>
                        <th scope="row">{r.role}</th>
                        <td style={{ color: 'var(--ink)' }}>{r.pick}</td>
                        <td>{r.license}</td>
                        <td>{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </ScrollTable>
              </More>
            </Exhibit>

            <Exhibit id="extension" code="EXT-C · 확장" status={<Tag>나중에</Tag>} title="확장: 브랜드 도용 감시">
              <p className="m-0 mb-3" style={{ color: 'var(--ink-2)' }}>
                같은 엔진으로 <b style={{ color: 'var(--ink)' }}>브랜드·연예기획사</b>가 자기 모델이나 소속 연예인 얼굴을 도용한 딥페이크 광고를 찾게 할 수 있다.
                돈을 낼 쪽이 분명한 확장이다.
              </p>
              <p className="m-0 mb-4" style={{ color: 'var(--ink-2)' }}>
                다만 나중에 한다. SNS를 대신 긁어 오는 건 플랫폼 약관에 걸리고, 남의 게시물을 &ldquo;도용&rdquo;이라고 지목했다가 틀리면 책임이 생긴다.
              </p>
              <Flag label="조건">
                <b>공식 API</b>와 <b>사용자가 직접 보낸 신고</b>로만 받고, 결과는 여기서와 같은 3단계로만 말한다.
              </Flag>
            </Exhibit>
          </div>

          {/* 위험 · 로드맵 */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-7">
            <Exhibit id="risks" code="RISK · 5건" status={<Tag tone="amber">대응 포함</Tag>} title="위험">
              <ol className="m-0 p-0 list-none grid gap-0" style={{ borderTop: '1px solid var(--rule)' }}>
                {RISKS.map((r, i) => (
                  <li key={r.risk} className="py-2.5 grid gap-x-3 sm:grid-cols-[7.2rem_minmax(0,1fr)]" style={{ borderBottom: '1px solid var(--rule)' }}>
                    <p className="m-0 flex items-baseline gap-2">
                      <span className="lab-mono text-[11.5px]" style={{ color: 'var(--amber)' }}>
                        R{i + 1}
                      </span>
                      <b className="!text-[15px]" style={{ color: 'var(--ink)' }}>
                        {r.risk}
                      </b>
                    </p>
                    <p className="m-0 !text-[14px] !leading-[1.62]" style={{ color: 'var(--ink-2)' }}>
                      {r.answer}
                    </p>
                  </li>
                ))}
              </ol>
            </Exhibit>

            <Exhibit id="roadmap" code="MAP · 6단계" status={<Tag tone="accent">01 · 지금</Tag>} title="로드맵">
              <ol className="m-0 p-0 list-none grid gap-0 relative">
                {ROADMAP.map((r, i) => (
                  <li key={r.step} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2 py-2" style={{ borderBottom: i < ROADMAP.length - 1 ? '1px dashed var(--rule)' : undefined }}>
                    <span className="lab-mono text-[12.5px] pt-[3px]" style={{ color: r.now ? 'var(--accent)' : 'var(--muted)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>
                      <b className="text-[15px]" style={{ color: r.now ? 'var(--accent)' : 'var(--ink)' }}>
                        {r.step}
                      </b>
                      {r.now && (
                        <span className="ml-2">
                          <Tag tone="accent">지금</Tag>
                        </span>
                      )}
                      <span className="block text-[13.5px] leading-[1.6]" style={{ color: 'var(--ink-2)' }}>
                        {r.detail}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </Exhibit>
          </div>
        </div>

        {/* 끝 CTA */}
        <aside aria-labelledby="try-title" className="lab-exh mt-8">
          <div className="lab-exh-head">
            <span>LIVE · 브라우저 안에서 판별</span>
            <Tag tone="accent">파일은 어디에도 올라가지 않음</Tag>
          </div>
          <div className="lab-exh-body grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-8">
            <div>
              <h2 id="try-title" className="!mb-2">
                내 이미지로 직접 검사해 보기
              </h2>
              <p className="m-0 max-w-[64ch]" style={{ color: 'var(--ink-2)' }}>
                이미지를 넣으면 C2PA·IPTC 표시를 확인하고, 판별 모델이 브라우저 안에서 점수를 매깁니다. 압축 실험에서 SNS처럼 줄여 보면 표시가 사라지고
                점수가 바뀌는 걸 직접 볼 수 있습니다.
              </p>
            </div>
            <div>
              <Link href={DEMO} className="btn btn-primary">
                직접 검사해 보기 <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </aside>

        <footer className="mt-10 pt-5 text-[14px] flex justify-between lab-mono" style={{ borderTop: '1px solid var(--rule)' }}>
          <Link href="/portfolio" className="link-u">
            ← 포트폴리오
          </Link>
          <Link href={DEMO} className="link-u">
            데모 →
          </Link>
        </footer>
        <AiImageFootnote />
      </div>
    </main>
  );
}

function Readout({ value, unit, label, source }: { value: React.ReactNode; unit: string; label: string; source: string }): JSX.Element {
  return (
    // 읽는 순서는 이름 → 값(dl 규칙), 보이는 순서는 값이 먼저
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] sm:grid-cols-[9rem_minmax(0,1fr)] gap-x-4 py-3 items-baseline" style={{ borderBottom: '1px solid var(--rule)' }}>
      <dt className="col-start-2 row-start-1 text-[14.5px] leading-[1.5]" style={{ color: 'var(--ink)' }}>
        {label}
        <span className="lab-mono block text-[12px] mt-0.5" style={{ color: 'var(--muted)' }}>
          {source}
        </span>
      </dt>
      <dd className="col-start-1 row-start-1 m-0 lab-mono leading-none" style={{ color: 'var(--accent)' }}>
        <span className="text-[28px] sm:text-[32px] font-bold">{value}</span>
        <span className="ml-1 text-[14px]">{unit}</span>
      </dd>
    </div>
  );
}

function LogLine({ when, what }: { when: string; what: string }): JSX.Element {
  return (
    <li className="grid grid-cols-[5.6rem_minmax(0,1fr)] gap-x-3 items-baseline">
      <span className="lab-mono text-[12.5px]" style={{ color: 'var(--accent)' }}>
        {when}
      </span>
      <span style={{ color: 'var(--ink-2)' }}>
        {what}
      </span>
    </li>
  );
}

function CheckItem({ name, detail }: { name: string; detail: string }): JSX.Element {
  return (
    <li className={CHECK}>
      <span className="lab-mono text-[12.5px]" style={{ color: 'var(--accent)' }} aria-hidden="true">
        [·]
      </span>
      <span className="!text-[15px]">
        <b style={{ color: 'var(--ink)' }}>{name}</b> <span style={{ color: 'var(--muted)' }}>— {detail}</span>
      </span>
    </li>
  );
}

function Meter({ label, value, from, delay, amber }: { label: string; value: number; from?: number; delay: number; amber?: boolean }): JSX.Element {
  return (
    <span className="grid grid-cols-[3.4rem_minmax(0,1fr)_3.4rem] items-center gap-2">
      <span className="lab-mono text-[11.5px]" style={{ color: 'var(--muted)' }}>
        {label}
      </span>
      <span className="lab-bar" data-tone={amber ? 'amber' : undefined} aria-hidden="true">
        <span style={{ '--to': value / 100, '--from': (from ?? 0) / 100, '--delay': `${delay}s` } as React.CSSProperties} />
      </span>
      <span className="lab-mono text-right text-[13px] font-semibold" style={{ color: amber && from !== undefined ? 'var(--amber)' : 'var(--ink)' }}>
        {value.toFixed(1)}%
      </span>
    </span>
  );
}
