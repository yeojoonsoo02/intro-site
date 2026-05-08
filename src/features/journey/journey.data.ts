// 시기별 사진 기록.
// 캡션은 사진에서 관찰 가능한 사실만 기술. 정확한 연도/나이는 비워두고
// 사용자가 직접 보강하기 전까지는 추정 라벨(어린 시절 등)로 유지한다.

export type JourneyLayout =
  | 'duo-portrait'      // 큰 얼굴 + 작은 전신, 좌우 분할
  | 'wide-cinematic'    // 풀 너비 와이드 사진
  | 'side-photo-left'   // 좌측 사진 + 우측 텍스트
  | 'side-photo-right'  // 좌측 텍스트 + 우측 사진
  | 'big-now';          // "지금" 큰 타이포 + 작은 사진

export interface JourneyItem {
  id: string;
  label: string;
  /** 시기 짧은 태그 (좌측 큰 디스플레이용) */
  era: string;
  /** 한두 문장 객관적 설명 */
  caption: string;
  /** public/journey/*.jpg 경로. 영유아기는 두 장 */
  photos: string[];
  /** 사진 alt — 보조 사진이 있으면 두 번째 alt도 함께 */
  alts: string[];
  layout: JourneyLayout;
}

export const JOURNEY_ITEMS: JourneyItem[] = [
  {
    id: 'infant',
    label: '처음 카메라를 응시하던 시기',
    era: '어린 시절',
    caption:
      '줄무늬 셔츠와 멜빵바지. 사진관도 아닌 일상 속에서 갑자기 찍힌 두 컷.',
    photos: [
      '/journey/01-infant-portrait.jpg',
      '/journey/02-infant-stand.jpg',
    ],
    alts: [
      '줄무늬 상의를 입고 카메라를 응시하는 어린 시절의 여준수',
      '멜빵바지를 입고 거실에 서 있는 같은 시기의 모습',
    ],
    layout: 'duo-portrait',
  },
  {
    id: 'pot',
    label: '엄마가 잠깐 뒤돌아본 사이',
    era: '유아기',
    caption:
      '주방 가스레인지 위 큰 냄비 안에서 발견된 사건. 손가락을 빨며 웃고 있다.',
    photos: ['/journey/03-toddler-pot.jpg'],
    alts: ['주방 큰 냄비 안에 들어가 손가락을 입에 문 채 웃고 있는 유아기 여준수'],
    layout: 'wide-cinematic',
  },
  {
    id: 'elementary',
    label: '단체복을 입던 운동회의 계절',
    era: '초등 고학년',
    caption:
      '김포시 행사 단체복. 그 무렵엔 운동회와 학교 체육행사가 가장 큰 사건이었다.',
    photos: ['/journey/04-elementary.jpg'],
    alts: ['형광 연두색 단체복을 입고 야외에서 카메라를 응시하는 초등기 여준수'],
    layout: 'side-photo-right',
  },
  {
    id: 'teen',
    label: '바깥을 좋아하기 시작한 무렵',
    era: '청소년기',
    caption: '푸른 별빛 정원에서. 회색 후드티 한 장으로 충분했던 밤 산책.',
    photos: ['/journey/05-teen-blue.jpg'],
    alts: ['푸른 LED 정원을 배경으로 회색 후드티를 입고 서 있는 청소년기 여준수'],
    layout: 'wide-cinematic',
  },
  {
    id: 'army',
    label: '잠깐 다른 옷을 입던 시기',
    era: '군 복무',
    caption: '교육수료식 — 마스크 너머의 무표정. 가족과 다시 만난 날.',
    photos: ['/journey/06-army.jpg'],
    alts: ['디지털 위장 군복을 입고 마스크를 쓴 채 행사장 의자에 앉아 있는 여준수'],
    layout: 'side-photo-left',
  },
  {
    id: 'now',
    label: '지금',
    era: '오늘',
    caption: '검정 티셔츠, 카메라 정면. 대학생 개발자로 새로운 것을 탐구하는 중.',
    photos: ['/journey/07-now.jpg'],
    alts: ['검정 티셔츠를 입고 정면을 응시하는 최근의 여준수'],
    layout: 'big-now',
  },
];
