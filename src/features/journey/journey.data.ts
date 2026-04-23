// 나이별 사진 갤러리 데이터
// 사진 파일은 아직 연결하지 않음 — 실제 사진·시기가 확정되면 photo/period를 채울 것.
// 레이아웃 variant 는 각 아이템이 AI처럼 균일하게 반복되지 않도록 의도적으로 다르게 지정.

export type JourneyVariant =
  | 'offset-left'   // 작은 사진 왼쪽, 큰 여백 + 짧은 라벨
  | 'split-right'   // 오른쪽 세로 사진 + 왼쪽 긴 캡션
  | 'full-bleed'    // 좌우 패딩 깨고 가로로 넓은 사진
  | 'stacked'       // 가운데 작은 사진 + 위아래 라벨·캡션
  | 'split-left'    // 왼쪽 세로 사진 + 오른쪽 짧은 라벨
  | 'portrait-right'; // 오른쪽에 증명사진형 소형 이미지

export type JourneyAspect = 'square' | 'portrait' | 'landscape';

export interface JourneyItem {
  id: string;
  /** 노출 라벨 — 시기 명. 확정 전에는 추정 라벨을 넣어둠 */
  label: string;
  /** 짧은 부제 — 연도·나이. 확정 전에는 빈 문자열 */
  period: string;
  /** 한 문장 캡션. 본인이 직접 채울 예정 */
  caption: string;
  /** public/journey/*.jpg 경로. 아직 미연결이면 null */
  photo: string | null;
  aspect: JourneyAspect;
  variant: JourneyVariant;
}

export const JOURNEY_ITEMS: JourneyItem[] = [
  {
    id: 'infant',
    label: '영유아기',
    period: '',
    caption: '',
    photo: null,
    aspect: 'portrait',
    variant: 'offset-left',
  },
  {
    id: 'toddler',
    label: '유아기',
    period: '',
    caption: '',
    photo: null,
    aspect: 'square',
    variant: 'split-right',
  },
  {
    id: 'elementary',
    label: '초등기',
    period: '',
    caption: '',
    photo: null,
    aspect: 'landscape',
    variant: 'full-bleed',
  },
  {
    id: 'graduation',
    label: '졸업식',
    period: '',
    caption: '',
    photo: null,
    aspect: 'portrait',
    variant: 'split-left',
  },
  {
    id: 'young-adult',
    label: '청년기',
    period: '',
    caption: '',
    photo: null,
    aspect: 'square',
    variant: 'stacked',
  },
  {
    id: 'recent',
    label: '최근',
    period: '',
    caption: '',
    photo: null,
    aspect: 'portrait',
    variant: 'portrait-right',
  },
]
