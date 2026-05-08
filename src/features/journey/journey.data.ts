// 시기별 사진 기록.
// 캡션은 사진에서 관찰 가능한 사실만 짧게 기록.

export type JourneyLayout =
  | 'duo-portrait'      // 큰 얼굴 + 작은 전신, 좌우 분할
  | 'wide-cinematic'    // 풀 너비 와이드 사진
  | 'side-photo-left'   // 좌측 사진 + 우측 텍스트
  | 'side-photo-right'  // 좌측 텍스트 + 우측 사진
  | 'big-now';          // "지금" 큰 타이포 + 작은 사진

export interface JourneyItem {
  id: string;
  /** 짧은 라벨 (사진 주제) */
  label: string;
  /** 시기 태그 */
  era: string;
  /** 한두 단어 사실 묘사. 비워두면 표시하지 않음 */
  caption: string;
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
      '멜빵바지를 입고 서 있는 같은 시기의 모습',
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
    era: '초등 고학년',
    caption: '형광 단체 티셔츠.',
    photos: ['/journey/04-elementary.jpg'],
    alts: ['형광 단체 티셔츠를 입고 야외에 서 있는 초등기 여준수'],
    layout: 'side-photo-right',
  },
  {
    id: 'teen',
    label: 'LED 정원',
    era: '중학생 무렵',
    caption: '회색 후드티, 야간.',
    photos: ['/journey/05-teen-blue.jpg'],
    alts: ['푸른 LED 정원을 배경으로 회색 후드티를 입은 청소년기 여준수'],
    layout: 'wide-cinematic',
  },
  {
    id: 'army',
    label: '교육수료식',
    era: '군 복무',
    caption: '디지털 위장복, 마스크 착용.',
    photos: ['/journey/06-army.jpg'],
    alts: ['디지털 위장 군복을 입고 마스크를 쓴 채 행사장에 앉아 있는 여준수'],
    layout: 'side-photo-left',
  },
  {
    id: 'now',
    label: '지금',
    era: '오늘',
    caption: '검정 티셔츠, 정면.',
    photos: ['/journey/07-now.jpg'],
    alts: ['검정 티셔츠를 입고 정면을 응시하는 최근의 여준수'],
    layout: 'big-now',
  },
];
