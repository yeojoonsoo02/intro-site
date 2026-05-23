// 시기별 사진 기록.
// 캡션은 사진에서 관찰 가능한 사실만 짧게 기록.
// 시기·연도는 본인 확인이 끝난 항목만 표기.

export type JourneyLayout =
  | 'duo-portrait'      // 큰 얼굴 + 작은 전신, 좌우 분할
  | 'wide-cinematic'    // 풀 너비 와이드 사진
  | 'side-photo-left'   // 좌측 사진 + 우측 텍스트
  | 'side-photo-right'  // 좌측 텍스트 + 우측 사진
  | 'age-display';      // 큰 나이 숫자 + 작은 사진

export interface JourneyItem {
  id: string;
  /** 짧은 라벨 (사진 주제) */
  label: string;
  /** 시기 태그 (좌측 작은 디스플레이) */
  era: string;
  /** age-display 레이아웃 전용. 큰 숫자로 띄움 */
  ageDisplay?: string;
  /** 사실 묘사 한 줄 */
  caption: string;
  /** 본인이 회고한 의미 — "그때 그 시기가 나에게 어떤 의미였는지" 한 줄 */
  reflection?: string;
  /** public/journey/*.jpg 경로 */
  photos: string[];
  alts: string[];
  layout: JourneyLayout;
}

export const JOURNEY_ITEMS: JourneyItem[] = [
  {
    id: 'infant',
    label: '줄무늬 상의',
    era: '어린 시절',
    caption: '멜빵바지를 입은 두 컷.',
    photos: [
      '/journey/01-infant-portrait.jpg',
      '/journey/02-infant-stand.jpg',
    ],
    alts: [
      '줄무늬 상의를 입은 어린 시절의 여준수',
      '멜빵바지를 입고 거실에 서 있는 같은 시기의 모습',
    ],
    layout: 'duo-portrait',
  },
  {
    id: 'pot',
    label: '주방',
    era: '유아기',
    caption: '가스레인지 위 큰 냄비 안.',
    photos: ['/journey/03-toddler-pot.jpg'],
    alts: ['주방 큰 냄비 안에 들어가 있는 유아기 여준수'],
    layout: 'wide-cinematic',
  },
  {
    id: 'elementary',
    label: '단체 행사',
    era: '초등기',
    caption: '형광 단체 티셔츠.',
    photos: ['/journey/04-elementary.jpg'],
    alts: ['형광 단체 티셔츠를 입고 야외에 서 있는 초등기 여준수'],
    layout: 'side-photo-right',
  },
  {
    id: 'high-3',
    label: 'LED 정원',
    era: '2020 · 고3',
    caption: '회색 후드티, 야간.',
    photos: ['/journey/05-teen-blue.jpg'],
    alts: ['푸른 LED 정원을 배경으로 회색 후드티를 입은 고3 시절의 여준수'],
    layout: 'wide-cinematic',
  },
  {
    id: 'nineteen-id',
    label: '증명사진',
    era: '19세',
    ageDisplay: '19',
    caption: '검정 티셔츠, 정면.',
    photos: ['/journey/07-now.jpg'],
    alts: ['검정 티셔츠를 입고 정면을 응시하는 19세의 여준수'],
    layout: 'age-display',
  },
  {
    id: 'army',
    label: '신병수료식',
    era: '21세 · 신병수료식',
    caption: '디지털 위장복, 마스크 착용. 가족과 함께.',
    photos: ['/journey/06-army.jpg'],
    alts: ['신병수료식에서 디지털 위장 군복과 마스크 차림으로 가족 옆에 앉아 있는 여준수'],
    layout: 'side-photo-left',
  },
];
