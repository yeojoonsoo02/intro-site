import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { OG_IMAGES, TWITTER_IMAGES } from '@/components/seo/ogMeta';
import SystemDiagram from '@/features/lonelyradar/SystemDiagram';
import { FadeCount, PlayOnView } from '@/features/lonelyradar/EditorialMotion';
import '@/features/lonelyradar/editorial.css';

// 졸업작품 구상 "1인가구 생활 리듬 레이더" 설명 페이지. 한국어만 있다(포트폴리오 상세와 같다).
// 데이터 없이 코드에 쓴 정적 페이지라 빌드 때 만들어 둔다. /portfolio/[id]보다 이 정적 경로가 먼저 잡힌다.
// 형식은 "조용한 에디토리얼" — 사회 문제를 다루는 잡지 기획 기사처럼 사진 한 장으로 열고, 큰 숫자와 좁은 읽기 단으로 이어 간다.
// 표·사양·논문 목록 같은 자세한 자료는 맨 아래 "편집자 노트"의 접힌 상자 하나로 보내고, 본문에서는 각주 번호로 잇는다.
// 숫자마다 출처와 확인 상태를 붙인다. "사망 감지"라고 쓰지 않는다 — 보는 것은 생활 리듬 이탈과 쓰러진 뒤 무활동뿐이다.

const URL = `${SITE_URL}/portfolio/lonely-radar`;
const TITLE = '1인가구 생활 리듬 레이더 — 포트폴리오 | 여준수';
const DESCRIPTION =
  '카메라 없는 60GHz 레이더가 원룸에 혼자 사는 사람의 움직임·호흡을 보고, 평소 생활 리듬에서 벗어나거나 쓰러진 뒤 움직임이 없으면 본인 → 관리자 → 연락처 순으로 알리는 구상과 웹 데모.';

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
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
    images: TWITTER_IMAGES,
  },
};

const DEMO = '/portfolio/lonely-radar/demo';
const SCI_REP_2026 = 'https://doi.org/10.1038/s41598-026-40330-y';
const BIOSENSORS_2025 = 'https://doi.org/10.3390/bios15080486';
const SENSORS_2025 = 'https://doi.org/10.3390/s25216540';
const ARXIV_2026 = 'https://arxiv.org/abs/2601.17710';
const SEEED_BHA2 = 'https://www.seeedstudio.com/MR60BHA2-60GHz-mmWave-Sensor-Breathing-and-Heartbeat-Module-p-5945.html';
const SEEED_FDA2 = 'https://www.seeedstudio.com/MR60FDA2-60GHz-mmWave-Sensor-Fall-Detection-Module-p-5946.html';

/** 오프닝 사진에서 벽의 센서 자리(사진 상자 기준 %) */
const SENSOR = { left: '75.9%', top: '23.1%' };

const FACTS: { claim: string; source: string; status: string }[] = [
  {
    claim: '2023년 고독사는 3,661명이었다.',
    source: '보건복지부 2024년 10월 발표',
    status: '기사 인용(2차) · 원문 미확인',
  },
  {
    claim: '그중 50대·60대 남성이 53.9%로 절반을 넘는다.',
    source: '같은 발표',
    status: '기사 인용(2차)',
  },
  {
    claim: '2022년부터 처음 발견한 사람 1위가 가족이 아니라 임대인·경비원·건물 관리자다.',
    source: '같은 발표',
    status: '기사 인용(2차)',
  },
  {
    claim: '고독사한 사람의 41.4%가 기초생활 수급자였다.',
    source: '같은 발표',
    status: '기사 인용(2차)',
  },
  {
    claim: '정부의 응급안전안심서비스는 65세 이상 혼자 사는 노인이 대상이라, 50~60대 1인가구는 빠질 가능성이 크다.',
    source: '제도 안내 기사',
    status: '2차 · 대상 기준 원문 미확인',
  },
];

type StateIcon = 'away' | 'move' | 'breath' | 'flat' | 'fall';

const STATES: {
  state: string;
  icon: StateIcon;
  sees: string;
  means: string;
  alert: string;
  accent?: boolean;
}[] = [
  {
    state: '집에 없음',
    icon: 'away',
    sees: '재실 신호가 5분 넘게 끊김',
    means: '외출·출근·여행',
    alert: '알리지 않는다. 집에 없으면 볼 수 있는 게 없다.',
  },
  {
    state: '움직임',
    icon: 'move',
    sees: '움직임 세기 15 이상',
    means: '씻기·청소·요리',
    alert: '없음 — 이게 "괜찮다"는 신호다.',
  },
  {
    state: '정지 + 호흡',
    icon: 'breath',
    sees: '가만히 있고 최근 10분 안에 호흡이 잡힘',
    means: '자는 중·쉬는 중',
    alert: '평소보다 너무 길 때만. 호흡이 보이면 2시간 더 기다린다.',
  },
  {
    state: '정지 + 호흡 미검출',
    icon: 'flat',
    sees: '가만히 있는데 호흡도 안 잡힘',
    means: '침대 밖에서 오래 가만히 있음 · 더 나쁜 경우',
    alert: '무활동 분(기본 45분)을 넘으면 알린다.',
    accent: true,
  },
  {
    state: '쓰러진 뒤 정지',
    icon: 'fall',
    sees: '천장 센서의 쓰러짐·바닥 점유 표시 + 움직임 없음',
    means: '쓰러져 못 일어남',
    alert: '쓰러짐 후 기다림(기본 10분)을 넘으면 알린다.',
    accent: true,
  },
];

const RULES: { name: string; rule: string }[] = [
  {
    name: '기상 시각 지남',
    rule: '집에서 잤는데 평소 기상 시각 + 여유 시간(기본 90분)이 지나도 움직임이 없다.',
  },
  {
    name: '평소보다 오래 정지',
    rule: '깨어 있는 동안, 기준선 기간에 가장 길게 가만히 있던 시간 + 여유 시간보다 오래 움직임이 없다.',
  },
  {
    name: '정지 + 호흡 미검출',
    rule: '가만히 있고 호흡도 안 잡히는 상태가 무활동 분만큼 이어진다.',
  },
  {
    name: '쓰러짐 뒤 무활동',
    rule: '쓰러짐 표시가 뜬 뒤 쓰러짐 후 기다림 분만큼 움직임이 없다.',
  },
  {
    name: '활동 감소(느린 변화)',
    rule: '최근 7일, 집에 있는 동안 움직인 비율이 평소보다 25% 넘게, 그리고 평소 흔들림(2SD)보다 크게 줄었다. 급한 알림이 아니라 주간 요약이다.',
  },
];

const LADDER: { t: string; who: string; what: string; wait?: string }[] = [
  { t: '0분', who: '본인', what: '본인 폰에 "괜찮으세요?" 알림이 간다.' },
  {
    t: '10분',
    who: '관리자',
    wait: '답이 없으면 10분 뒤',
    what: '임대인·관리사무소에 문자. 문을 두드리거나 전화한다.',
  },
  {
    t: '40분',
    who: '비상 연락처',
    wait: '그래도 해결되지 않으면 30분 뒤',
    what: '등록한 가족·지인에게. 필요하면 119.',
  },
];

const HARDWARE: {
  part: string;
  role: string;
  price: string;
  source: string;
  href?: string;
}[] = [
  {
    part: 'Seeed MR60BHA2 (60GHz 호흡·심박 키트)',
    role: '침대 위에서 호흡수·심박·재실. XIAO ESP32-C6 포함',
    price: 'US$26.90 (약 3만 8천 원)',
    source: '판매 페이지 확인 2026-11-04',
    href: SEEED_BHA2,
  },
  {
    part: 'Seeed MR60FDA2 (60GHz 낙상 키트)',
    role: '천장에서 쓰러짐·바닥 점유. XIAO ESP32-C6 포함',
    price: 'US$26.90 (약 3만 8천 원)',
    source: '판매 페이지 확인 2026-11-04',
    href: SEEED_FDA2,
  },
  {
    part: 'DFRobot C1001 (60GHz)',
    role: '낙상·수면 겸용 대안',
    price: 'US$29 (약 4만 1천 원)',
    source: '조사 노트 기준 2026-11-04',
  },
  {
    part: 'HLK-LD2410 (24GHz)',
    role: '재실만 보는 싼 대안',
    price: '약 1만 원 (디바이스마트)',
    source: '조사 노트 기준 2026-11-04',
  },
  {
    part: 'Infineon KIT CSK BGT60 / TI IWRL6432 EVM',
    role: '연구용 평가 보드 — 원신호를 받아 키트 결과값을 검증',
    price: '221,636원 / 316,182원 (엘레파츠)',
    source: '조사 노트 기준 2026-11-04',
  },
];

const INSTALL: { where: string; how: string }[] = [
  {
    where: '침대용(호흡·심박)',
    how: '침대 머리 위 약 1m 높이에서 45° 아래로. 누운 자세의 가슴까지 1.5m 안쪽.',
  },
  {
    where: '천장용(낙상)',
    how: '천장 2.2~3.0m, 바닥 약 3×3m를 본다. 원룸이면 방 가운데.',
  },
  {
    where: '재실만',
    how: '약 6m까지. 원룸에 한 대만 단다면 재실만 믿을 만하다.',
  },
  {
    where: '전원',
    how: '상시 5V 콘센트가 필요하다. 레이더는 늘 켜져 있어 배터리로는 현실적이지 않다. 붙이는 받침이라 벽에 구멍을 내지 않는다.',
  },
];

const STAGES: { name: string; period: string; how: string; measure: string }[] = [
  {
    name: '실험실',
    period: '2~4주',
    how: '호흡 벨트(또는 손으로 센 호흡수)와 키트 값을 나란히 기록한다. 매트 위에서 쓰러짐을 연출한다. 평가 보드 하나로 원신호도 같이 받는다.',
    measure: '호흡수 오차, 쓰러짐 검출률, 키트 결과값과 원신호 처리 결과의 차이',
  },
  {
    name: '실거주',
    period: '2~4주',
    how: '지인 자취방 2~4곳에 침대용 + 천장용을 단다. 거주자 서면 동의를 받고, 학교 IRB 대상인지 먼저 확인한다(권장).',
    measure: '주당 헛경보 횟수 — 이 구상의 핵심 숫자',
  },
  {
    name: '이탈 연출',
    period: '1~2주',
    how: '같은 방에서 8시간 부재, 침대 밖 장시간 무활동, 쓰러짐 연출을 미리 약속하고 해 본다.',
    measure: '이상이 시작된 때부터 본인 확인·관리자 알림까지 걸린 시간',
  },
];

const EVIDENCE: { claim: string; source: string; href: string }[] = [
  {
    claim: '여러 사람이 있는 방에서 mmWave 레이더 낙상 감지 정확도 97.9%. 참가자 10명, 웨어러블 센서로 검증.',
    source: 'Scientific Reports, 2026',
    href: SCI_REP_2026,
  },
  {
    claim: '120GHz 레이더 두 대로 가슴·배 호흡을 따로 잼. 호흡 벨트와 상관 0.92, 호흡수 RMSE 0.80회/분(건강인 35명 + 환자 3명).',
    source: 'Biosensors 15(8):486, 2025',
    href: BIOSENSORS_2025,
  },
  {
    claim: '노인 낙상 감지 기술 체계적 리뷰. 논문 80편을 비교했고, 몸에 차는 센서가 성능이 가장 낮았다.',
    source: 'Sensors 25(21):6540, 2025',
    href: SENSORS_2025,
  },
  {
    claim: '저가 60GHz 레이더로 "쓰러진 뒤 바닥에 있음"을 잡는 비율을 0.823에서 0.916으로 올림(참가자 7명).',
    source: 'arXiv 2601.17710, 2026',
    href: ARXIV_2026,
  },
];

const SIM_RESULTS = [
  '정상 생활의 헛경보는 주당 약 0.8번(본인 확인 단계)이고, 관리자까지 간 것은 세 시나리오를 합쳐 주당 약 0.24번이다. 대부분 바닥에 누워 쉰 것을 천장 센서가 쓰러짐으로 본 경우다.',
  '늦잠이 섞인 주는 헛경보가 주당 약 1.4번. "호흡이 보이면 2시간 더 기다림"을 끄면 약 3.1번, 관리자까지 가는 것은 주당 약 0.9번으로 늘어난다.',
  '쓰러진 뒤 첫 알림까지 중앙값 17분(천장 센서 있음). 센서가 없으면 침대 밖 무활동 규칙에 기대야 해서 약 1.8시간 걸린다.',
  '무활동 분을 45분에서 15분으로 줄이면 센서 없이도 35분 만에 알지만, 정상 생활 헛경보가 주당 약 5.9번으로 뛴다.',
  '움직이는 시간이 3주에 걸쳐 줄 때 주간 요약까지 중앙값 17일.',
];

const COMPETITORS: { name: string; what: string; gap: string }[] = [
  {
    name: '정부 응급안전안심서비스',
    what: '혼자 사는 노인 집에 화재·활동 센서와 응급 호출기를 둔다.',
    gap: '65세 이상이 대상이라 50~60대가 빠질 가능성이 크다(2차 자료).',
  },
  {
    name: '통신사 AI 돌봄',
    what: 'AI 스피커가 말을 걸고, 대화·사용 기록으로 안부를 본다.',
    gap: '말을 걸어야 반응이 생긴다. 쓰러진 뒤 무활동은 따로 보지 않는 경우가 많다(제품별 미확인).',
  },
  {
    name: '전력 사용량 안부 서비스',
    what: '전기 사용 패턴이 평소와 다르면 알린다. 설치가 필요 없다.',
    gap: '하루 단위라 느리다. 집 안에서 쓰러진 것과 외출을 가리기 어렵다.',
  },
];

const EDGES = [
  '50~60대 사각지대: 노인 돌봄 제도 밖에 있는 1인가구.',
  '카메라 없음: 영상·소리 없이 상태 이벤트만 보낸다.',
  '임대인 과금: 처음 발견하는 사람이 돈을 내고 알림을 받는다.',
  '실측 헛경보율 공개: 실거주 시험의 주당 헛경보를 숨기지 않고 싣는다.',
];

const RISKS: { risk: string; answer: string }[] = [
  {
    risk: '헛경보',
    answer:
      '늦잠·긴 낮잠·바닥에 누워 쉬기가 제일 흔한 원인이다. 호흡이 잡히면 한 번 더 기다리고, 다른 사람 평균이 아니라 그 사람의 기준선과 비교한다. 본인이 "괜찮아요"를 누르면 관리자에게 가지 않는다.',
  },
  {
    risk: '사생활',
    answer:
      '영상·소리를 만들지 않는다. 서버로 가는 것은 1분 상태값과 사건뿐이다. 호흡 기록은 민감한 건강 정보로 다뤄질 수 있어(일반론) 세입자 서면 동의 없이는 달지 않고, 동의를 거두면 바로 뗀다.',
  },
  {
    risk: '놓친 알림',
    answer: '레이더가 못 보는 곳(욕실·현관)이 있다. 설치할 때 사각지대를 적어 주고, "알림이 없으니 괜찮다"로 읽히지 않게 한다.',
  },
  {
    risk: '오작동',
    answer: '커튼·식물·거울과 금속·유리 너머·진동이 헛것을 만든다. 설치 점검표에 넣고, 실거주 시험에서 무엇이 실제로 문제인지 센다.',
  },
  {
    risk: '경쟁',
    answer: '큰 회사 서비스가 이미 있다. 50~60대 사각지대·카메라 없음·임대인 과금·실측 헛경보율 공개라는 좁은 자리에서 먼저 쓸모를 보인다.',
  },
];

const ROADMAP: { step: string; detail: string; now?: boolean }[] = [
  {
    step: '시뮬레이터 + 알고리즘 웹 데모',
    detail: '1분 레이더 값 → 상태 머신 → 개인 기준선 → 이탈 규칙 → 단계 알림 → 헛경보 미터.',
    now: true,
  },
  {
    step: '키트 2대 + 평가 보드로 실험실 시험',
    detail: '호흡 벨트와 비교하고 매트 위 쓰러짐을 연출한다. 키트 결과값이 원신호 처리와 얼마나 맞는지 본다.',
  },
  {
    step: '지인 자취방 2~4곳 실거주',
    detail: '서면 동의, IRB 확인. 주당 헛경보를 세고 문턱값을 다시 고른다.',
  },
  {
    step: '이탈 연출',
    detail: '부재·무활동·쓰러짐을 약속하고 연출해 알림까지 걸린 시간을 잰다.',
  },
  {
    step: '임대인·관리사무소 파일럿',
    detail: '방 단위 월 요금을 시험한다. 그다음 LH·SH 공공임대와 지자체에 실측 숫자를 들고 간다.',
  },
  {
    step: '확장: 어르신 시설용 빠른 낙상 위험 기록',
    detail:
      '주야간보호·복지관·실버타운용. 레이더 무활동 감지에 월 1회 몇 분짜리 "일어나 걷기" 검사(허리 IMU 또는 폰)를 더해 추세를 남긴다. 반복 측정 일치도는 ICC 약 0.9로 보고됐지만 낙상 예측력은 보통이라 "신체 기능 기록"으로만 쓴다.',
  },
];

export default function LonelyRadarPage(): JSX.Element {
  return (
    <main className="lr">
      <article>
        <Opening />

        <div className="lr-wrap">
          <div className="lr-lede-row">
            <dl className="lr-glance" aria-label="한눈에">
              <dt>대상</dt>
              <dd>원룸·오피스텔에 혼자 사는 50~60대 남성</dd>
              <dt>돈 내는 쪽</dt>
              <dd>임대인·관리사무소, LH·SH 공공임대, 지자체(B2G)</dd>
              <dt>형태</dt>
              <dd>60GHz 레이더 키트 1~2대 + 서버 + 단계 알림</dd>
              <dt>하지 않는 것</dt>
              <dd>사망 감지라고 말하지 않는다 · 영상·소리를 만들지 않는다</dd>
              <dt>지금</dt>
              <dd>시뮬레이터와 알고리즘 웹 데모 (2026-11)</dd>
            </dl>
            <p className="lr-lede">
              혼자 사는 사람이 집에서 쓰러지면, 알아채는 사람이 며칠씩 없을 수 있다. 고독사 통계에서 가장 많은 쪽은 노인이 아니라 50~60대 남성이고, 처음
              발견하는 사람은 가족보다 임대인·경비원·관리자가 많다.
            </p>
          </div>
        </div>

        <section aria-labelledby="numbers-title" className="lr-band">
          <div className="lr-band-inner">
            <h2 id="numbers-title" className="sr-only">
              숫자로 본 문제
            </h2>
            <Stat num={<FadeCount to={3661} />} unit="명" claim="2023년 한 해의 고독사." source="보건복지부 2024년 10월 발표 · 기사 인용(2차) · 원문 미확인" />
            <Stat num={<FadeCount to={53.9} decimals={1} />} unit="%" claim="그중 50대·60대 남성의 몫. 절반을 넘는다." source="같은 발표 · 기사 인용(2차)" />
            <Stat
              num={
                <PlayOnView as="span" className="inline-block">
                  <span className="lr-fade inline-block">1</span>
                </PlayOnView>
              }
              unit="위"
              claim="2022년부터 처음 발견한 사람 1위는 가족이 아니라 임대인·경비원·건물 관리자다."
              source="같은 발표 · 기사 인용(2차)"
            />
          </div>
        </section>

        <div className="lr-wrap">
          <Sec id="problem" label="문제" title="알림은 건물을 관리하는 쪽으로" quote="세입자에게는 카메라 없이, 평소와 다를 때만 먼저 본인에게 묻는 장치다.">
            <p className="lr-p">
              그래서 알림을 받을 사람과 돈을 낼 사람을 &ldquo;건물을 관리하는 쪽&rdquo;으로 잡았다. 정부의 응급안전안심서비스는 65세 이상 혼자 사는 노인이
              대상이라, 50~60대 1인가구는 빠질 가능성이 크다(2차 · 대상 기준 원문 미확인). 숫자는 정부 발표를 옮긴 기사에서 가져왔고 원문은 아직 열어 보지
              못했다.
              <NoteRef href="#note-facts" n={1} />
            </p>
          </Sec>

          <Sec
            id="states"
            label="보는 것"
            title="카메라 없는 레이더가 보는 것"
            wide={
              <ul className="lr-states lr-wide" aria-label="레이더가 구분하는 다섯 상태">
                {STATES.map((s) => (
                  <li key={s.state} className="lr-state" data-alert={s.accent ? '' : undefined}>
                    <StateGlyph kind={s.icon} />
                    <p className="lr-state-name">
                      {s.state}
                      <span>{s.means}</span>
                    </p>
                    <p className="lr-state-desc">
                      {s.sees}. <b>알림</b> {s.alert}
                    </p>
                  </li>
                ))}
              </ul>
            }
          >
            <p className="lr-p">
              레이더 키트는 영상이 아니라 &ldquo;재실·움직임 세기·호흡수·쓰러짐&rdquo; 같은 결과값만 준다. 상태 머신은 이 값만 보고 1분마다 다섯 상태 중 하나를
              고른다. 정적 재실이 한두 분 끊기는 것은 앞 상태를 이어 가서 &ldquo;나갔다 들어왔다&rdquo;로 읽지 않는다.
              <NoteRef href="#system" n={3} />
            </p>
          </Sec>

          <Sec id="baseline" label="리듬" title="평소의 리듬, 그리고 벗어남" quote="늦잠과 쓰러짐은 둘 다 ‘아침에 안 움직임’이다.">
            <p className="lr-p">
              설치 뒤 처음 2주(데모 기본 14일)가 그 사람의 평소가 된다. 평일·주말 기상 시각과 잠드는 시각의 중앙값, 깨어 있을 때 가장 길게 가만히 있던 시간,
              집에 있는 동안 움직인 비율을 적어 두고, 이 기간에는 알리지 않는다. 이탈은 고정 시각(&ldquo;아침 9시까지 안 움직이면&rdquo;)이 아니라 그 사람의
              평소에 여유 시간을 더한 값으로 잰다.
            </p>
            <p className="lr-p">
              침대 위에서 호흡이 잡히면 자는 중일 가능성이 높아 2시간 더 기다린다. 침대 밖에서 호흡도 안 잡히는 정지는 기다리지 않는다.
              <NoteRef href="#note-rules" n={2} />
            </p>
          </Sec>

          <Sec
            id="ladder"
            label="알림"
            title="먼저 본인에게 묻는다"
            aside={
              <Stat
                rail
                num={<FadeCount to={17} />}
                unit="분"
                claim="시뮬레이터에서 쓰러진 뒤 첫 알림까지 걸린 중앙값(천장 센서 있음). 센서가 없으면 약 1.8시간 걸린다."
                source="시뮬레이션 · 실제 사람 데이터 아님"
              />
            }
          >
            <PlayOnView as="ol" className="lr-ladder" threshold={0.5}>
              {LADDER.map((s, i) => (
                <li key={s.who} className="lr-rung" style={{ '--i': i } as React.CSSProperties}>
                  <span className="lr-rung-t">+{s.t}</span>
                  <span className="lr-rung-dot" aria-hidden="true" />
                  <div className="lr-rung-body">
                    {s.wait && <p className="lr-rung-wait">{s.wait}</p>}
                    <h3 className="lr-rung-who">{s.who}</h3>
                    <p className="lr-rung-what">{s.what}</p>
                    {i === 0 && (
                      <p className="lr-ok">
                        <span className="lr-ok-pill">
                          <span aria-hidden="true">✓</span> 괜찮아요
                        </span>
                        를 누르면 여기서 끝나고, 같은 규칙은 1시간 조용하다.
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </PlayOnView>
            <p className="lr-p" style={{ marginTop: 24 }}>
              어느 단계에서든 레이더가 2분 연달아 움직임을 보면 저절로 멈춘다. 헛경보의 비용은 &ldquo;본인에게 한 번 묻기&rdquo;로 끝내고, 관리자에게 가는 횟수를
              줄이는 것이 설계 목표다. 기다리는 시간(10분·30분)은 임시값이다.
              <NoteRef href="#note-sim" n={6} />
            </p>
          </Sec>

          <Sec id="validation" label="검증" title="실험실, 자취방, 그리고 약속한 연출">
            <ol className="lr-steps lr-steps--3">
              {STAGES.map((s) => (
                <li key={s.name} className="lr-step">
                  <p className="lr-step-name">
                    {s.name}
                    <em>{s.period}</em>
                  </p>
                  <p className="lr-step-detail">{s.how}</p>
                  <p className="lr-step-measure">
                    <span>재는 것</span>
                    {s.measure}
                  </p>
                </li>
              ))}
            </ol>
            <p className="lr-small" style={{ marginTop: 12 }}>
              부품·설치 위치·가격은 자료 4에 있다.
              <NoteRef href="#hardware" n={4} />
            </p>
          </Sec>
        </div>

        <section id="contribution" aria-labelledby="contribution-title" className="lr-statement">
          <div className="lr-statement-inner">
            <p className="lr-label">기여</p>
            <h2 id="contribution-title" className="lr-statement-h">
              왜 아직 아무도 재지 않았나
            </h2>
            <blockquote className="lr-statement-q">실제 집에서 몇 주 동안 헛경보가 얼마나 나는지를 보고한 논문은 찾지 못했다.</blockquote>
            <p className="lr-p lr-statement-p">
              실험실이나 짧은 시험의 정확도는 높게 나온다. 여러 사람이 있는 방에서 mmWave 레이더 낙상 감지 정확도 97.9%(참가자 10명, Scientific Reports 2026)
              같은 결과가 있다.
              <NoteRef href="#note-evidence" n={5} /> 그 숫자를 재서 공개하는 것이 이 졸업작품의 기여 지점이다. 주당 헛경보 횟수는 숨기지 않고 싣는다.
              <NoteRef href="#compare" n={7} />
            </p>
          </div>
        </section>

        <div className="lr-wrap">
          <Sec
            id="roadmap"
            label="다음"
            title="데모에서 공공임대로, 그리고 어르신 시설로"
            wide={
              <ol className="lr-steps lr-steps--3 lr-wide">
                {ROADMAP.map((r) => (
                  <li key={r.step} className="lr-step" data-now={r.now ? '' : undefined}>
                    <p className="lr-step-name">
                      {r.step}
                      {r.now && <em>지금</em>}
                    </p>
                    <p className="lr-step-detail">{r.detail}</p>
                  </li>
                ))}
              </ol>
            }
          >
            <p className="lr-p">
              여섯 단계 중 지금은 첫 단계, 시뮬레이터와 알고리즘 웹 데모다. 실측 숫자가 생기면 임대인·관리사무소 파일럿을 거쳐 공공임대와 지자체로, 그다음 어르신
              시설로 넓힌다.
              <NoteRef href="#risks" n={8} />
            </p>
          </Sec>
        </div>

        <aside className="lr-night" aria-labelledby="try-title">
          <div className="lr-night-art" aria-hidden="true">
            <Image src="/portfolio/lonely-radar/night-window.webp" fill sizes="100vw" alt="" />
          </div>
          <div className="lr-night-inner">
            <h2 id="try-title">시뮬레이터로 해 보기</h2>
            <p>
              정상 생활·늦잠·장기 외출·쓰러짐·활동 감소 중 하나를 골라 42일을 돌립니다. 여유 시간과 무활동 분을 바꾸면 헛경보와 알림까지 걸리는 시간이 어떻게
              바뀌는지 바로 계산합니다. 전부 브라우저 안에서 돕니다.
            </p>
            <Link href={DEMO} className="lr-open-cta">
              데모 열기 <span aria-hidden="true">→</span>
            </Link>
          </div>
          <span className="lr-chip">AI 이미지 · 로컬 FLUX.2 klein</span>
        </aside>

        <div className="lr-wrap">
          <EditorNotes />

          <footer className="lr-foot">
            <nav aria-label="이 페이지 밖으로">
              <Link href="/portfolio" className="link-u">
                ← 포트폴리오
              </Link>
              <Link href={DEMO} className="link-u">
                데모 →
              </Link>
            </nav>
            <p className="lr-small">
              이 페이지의 사진 두 장은 실제 촬영이 아니라, 이 작업용 맥에서 오픈소스 모델(FLUX.2 klein 4B, Apache-2.0)로 만든 AI 이미지입니다. 사람·실제 제품은
              나오지 않습니다.
            </p>
          </footer>
        </div>
      </article>
    </main>
  );
}

function Opening(): JSX.Element {
  return (
    <header className="lr-open">
      <div className="lr-open-art">
        <Image
          src="/portfolio/lonely-radar/dusk-studio.webp"
          fill
          priority
          sizes="(min-width: 1400px) 1600px, 100vw"
          alt="해가 막 진 뒤 불 꺼진 원룸. 큰 창 너머로 푸른 하늘과 아파트 불빛이 보이고, 침대 옆 스탠드 하나만 켜져 있다. 벽 높은 곳에 작은 흰 센서가 붙어 있다."
        />
        <span aria-hidden="true">
          <span className="lr-ring" style={SENSOR} />
          <span className="lr-ring" style={SENSOR} />
          <span className="lr-ring" style={SENSOR} />
          <span className="lr-sensor" style={SENSOR} />
        </span>
      </div>
      <div className="lr-open-inner">
        <Link href="/portfolio" className="lr-open-back">
          <span aria-hidden="true">←</span> 전체 프로젝트
        </Link>
        <div>
          <h1>
            <span className="lr-kicker">1인가구 생활 리듬 레이더</span>
            <span className="lr-headline">혼자 쓰러져도, 며칠씩 모르는 일이 없도록</span>
          </h1>
          <p className="lr-deck">
            카메라 없는 레이더가 움직임과 호흡을 본다. 평소 생활 리듬에서 벗어나거나 쓰러진 뒤 움직임이 없으면 본인 → 관리자 → 연락처 순으로 알린다.
          </p>
          <div className="lr-byline">
            <span className="lr-byline-meta">졸업작품 구상 · 2026.11 · 웹 데모 있음</span>
            <Link href={DEMO} className="lr-open-cta">
              시뮬레이터 데모 열기 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
      <span className="lr-chip">AI 이미지 · 로컬 FLUX.2 klein</span>
    </header>
  );
}

interface SecProps {
  id: string;
  label: string;
  title: string;
  /** 왼쪽 여백 단에 크게 앉히는 인용 한 줄(본문에서 뽑은 문장) */
  quote?: string;
  /** 여백 단에 같이 두는 큰 숫자 */
  aside?: React.ReactNode;
  children: React.ReactNode;
  /** 읽기 단 밖으로 넓게 펼치는 그림 목록 */
  wide?: React.ReactNode;
}

/** 이야기 단락: 넓은 화면에서는 왼쪽 여백 단에 꼭지·제목·인용, 오른쪽 좁은 읽기 단에 본문. 좁은 화면에서는 한 단. */
function Sec({ id, label, title, quote, aside, children, wide }: SecProps): JSX.Element {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="lr-sec">
      <header className="lr-sec-head">
        <p className="lr-label">{label}</p>
        <h2 id={`${id}-title`} className="lr-h2">
          {title}
        </h2>
        {quote && <blockquote className="lr-quote">{quote}</blockquote>}
        {aside}
      </header>
      <div className="lr-sec-body">{children}</div>
      {wide}
    </section>
  );
}

interface StatProps {
  num: React.ReactNode;
  unit: string;
  claim: string;
  source: string;
  /** 여백 단 안에 세로로 쌓는 작은 판 */
  rail?: boolean;
}

/** 큰 숫자 한 개 + 한 문장 + 출처·확인 상태 */
function Stat({ num, unit, claim, source, rail }: StatProps): JSX.Element {
  return (
    <figure className={rail ? 'lr-stat lr-stat--rail' : 'lr-stat'}>
      <p className="lr-num">
        {num}
        <small>{unit}</small>
      </p>
      <figcaption>
        <p className="lr-stat-claim">{claim}</p>
        <p className="lr-stat-src">{source}</p>
      </figcaption>
    </figure>
  );
}

/** 본문에서 편집자 노트의 해당 자료로 가는 각주 번호 */
function NoteRef({ href, n }: { href: string; n: number }): JSX.Element {
  return (
    <a href={href} className="lr-ref" aria-label={`자료 ${n} 보기`}>
      {n}
    </a>
  );
}

function StateGlyph({ kind }: { kind: StateIcon }): JSX.Element {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <svg viewBox="0 0 52 30" aria-hidden="true">
      {kind === 'away' && <circle cx="26" cy="15" r="10" {...common} strokeDasharray="2.5 3.5" />}
      {kind === 'move' && <path d="M2 15 H10 L14 5 L20 25 L26 7 L32 23 L36 15 H50" {...common} />}
      {kind === 'breath' && <path d="M2 15 C8 7 14 7 20 15 S32 23 38 15 S46 9 50 15" {...common} />}
      {kind === 'flat' && <path d="M2 15 H50" {...common} />}
      {kind === 'fall' && (
        <g {...common}>
          <path d="M26 3 V18 M20 12 L26 18 L32 12" />
          <path d="M8 26 H44" />
        </g>
      )}
    </svg>
  );
}

/** 편집자 노트 안의 자료 한 꼭지(각주처럼 번호를 단 옆글) */
function Note({ id, n, title, children }: { id: string; n: number; title: string; children: React.ReactNode }): JSX.Element {
  return (
    <section id={id} className="lr-note" aria-labelledby={`${id}-t`}>
      <h3 id={`${id}-t`}>
        <span className="lr-note-n">{n}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

/** 표·사양·논문 목록 같은 자세한 자료. 한 번에 펼치는 상자 하나로 접어 두고, 펼치면 각주처럼 번호 단 옆글이 두 단으로 놓인다. */
function EditorNotes(): JSX.Element {
  return (
    <section className="lr-notes" aria-labelledby="notes-title">
      <details className="lr-dossier">
        <summary>
          <span className="lr-dossier-text">
            <span className="lr-label">편집자 노트</span>
            <span id="notes-title" className="lr-dossier-title">
              자료 전체 보기
            </span>
            <span className="lr-dossier-sub">
              본문 각주 1~8: 근거와 확인 상태 · 이탈 규칙 · 시스템 구성 · 하드웨어와 가격 · 연구 4편 · 시뮬레이터 수치 · 경쟁 · 위험. 확인일 2026-11-04.
            </span>
          </span>
          <span className="lr-dossier-btn" aria-hidden="true">
            <span className="lr-dossier-open">펼치기</span>
            <span className="lr-dossier-close">접기</span>
          </span>
        </summary>

        <div className="lr-dossier-body">
          <Note id="note-facts" n={1} title="근거와 확인 상태">
            <ul className="lr-list">
              {FACTS.map((f) => (
                <li key={f.claim}>
                  {f.claim}
                  <span className="lr-src">
                    {f.source} · {f.status}
                  </span>
                </li>
              ))}
            </ul>
            <p className="lr-small">발표 원문은 아직 열어 보지 못했다. 원문을 확인하면 출처 링크를 붙이고 상태를 바꾼다.</p>
          </Note>

          <Note id="note-rules" n={2} title="이탈 규칙 다섯 가지">
            <ul className="lr-list">
              {RULES.map((r) => (
                <li key={r.name}>
                  <b>{r.name}</b> — {r.rule}
                </li>
              ))}
            </ul>
          </Note>

          <Note id="system" n={3} title="시스템 구성">
            <SystemDiagram />
            <p className="lr-small">
              같은 재실·호흡 레이더가{' '}
              <Link href="/portfolio/english-roommate" className="link-u">
                영어 룸메이트
              </Link>{' '}
              기기의 &ldquo;사람 감지&rdquo; 부분이기도 하다. 레이더 읽기·상태 머신을 공용 모듈로 만들어 두 프로젝트가 같이 쓴다.
            </p>
          </Note>

          <Note id="hardware" n={4} title="하드웨어 · 설치 · 가격">
            <div className="lr-table-wrap" tabIndex={0} role="region" aria-label="부품과 가격 표">
              <table className="lr-table">
                <caption className="sr-only">부품과 가격(확인일 2026-11-04, 환율 1달러 1,400원 가정)</caption>
                <thead>
                  <tr>
                    {['부품', '하는 일', '가격', '확인'].map((h) => (
                      <th key={h} scope="col">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HARDWARE.map((h) => (
                    <tr key={h.part}>
                      <th scope="row">{h.part}</th>
                      <td>{h.role}</td>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{h.price}</td>
                      <td style={{ fontSize: 13 }}>
                        {h.href ? (
                          <a href={h.href} className="link-u" target="_blank" rel="noopener noreferrer">
                            {h.source}
                          </a>
                        ) : (
                          h.source
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="lr-small">
              원화는 1달러 1,400원으로 환산했다. 키트 한 대에 받침·전원·배송을 더하면 <b>1대 약 5~6만 원</b>, 제대로 하려면 침대용 1대 + 천장용 1대로{' '}
              <b>방 하나에 약 10~12만 원</b>으로 본다(둘 다 추정). 키트는 결과값만 주므로, 알고리즘 연구용으로 평가 보드 하나를 기준 장비로 둔다.
            </p>
            <h4>설치</h4>
            <ul className="lr-list">
              {INSTALL.map((s) => (
                <li key={s.where}>
                  <b>{s.where}</b> — {s.how}
                </li>
              ))}
            </ul>
            <p className="lr-small">
              오작동 요인: 커튼·식물이 흔들리는 것, 거울·금속, 유리 너머, 세탁기 같은 진동. 설치 위치는 조사 노트의 제조사 안내를 옮긴 것이고 실험실 단계에서
              다시 잰다. 세입자 서면 동의는 필수다.
            </p>
          </Note>

          <Note id="note-evidence" n={5} title="지금까지 나온 연구">
            <ul className="lr-list">
              {EVIDENCE.map((e) => (
                <li key={e.href}>
                  {e.claim}
                  <span className="lr-src">
                    <a href={e.href} className="link-u" target="_blank" rel="noopener noreferrer">
                      {e.source}
                    </a>{' '}
                    · 조사 노트 기준 · 초록 확인 2026-11-04
                  </span>
                </li>
              ))}
            </ul>
            <p className="lr-small">실험실이나 짧은 시험의 정확도는 높게 나온다. 그런데 실제 집에서 몇 주 동안 헛경보가 얼마나 나는지를 보고한 논문은 찾지 못했다.</p>
          </Note>

          <Note id="note-sim" n={6} title="시뮬레이터로 먼저 잰 값">
            <p className="lr-small">
              데모의 시뮬레이터(시드 6개 × 42일, 기준선 14일, 기본 문턱값)에서 잰 예비 결과다. <b>실제 사람 데이터가 아니라</b> 시뮬레이터 가정 안에서만 의미가
              있다.
            </p>
            <ul className="lr-list">
              {SIM_RESULTS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </Note>

          <Note id="compare" n={7} title="경쟁과 차별점">
            <ul className="lr-list">
              {COMPETITORS.map((c) => (
                <li key={c.name}>
                  <b>{c.name}</b> — {c.what}
                  <span className="lr-src">{c.gap}</span>
                </li>
              ))}
            </ul>
            <h4>이 구상이 서는 자리</h4>
            <ul className="lr-list">
              {EDGES.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </Note>

          <Note id="risks" n={8} title="위험과 대응">
            <ul className="lr-list">
              {RISKS.map((r) => (
                <li key={r.risk}>
                  <b>{r.risk}</b> — {r.answer}
                </li>
              ))}
            </ul>
          </Note>
        </div>
      </details>
    </section>
  );
}
