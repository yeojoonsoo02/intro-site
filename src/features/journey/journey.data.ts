// 나이별 사진 갤러리 데이터
// 사진 파일은 아직 연결하지 않음 — 실제 사진·시기가 확정되면 photo/period/caption 채움.

export interface JourneyItem {
  id: string;
  /** 시기 라벨 (예: 영유아기, 초등기) */
  label: string;
  /** 연도·나이 같은 부가 정보 (예: 2005 · 3세) */
  period: string;
  /** 한두 문장 설명 */
  caption: string;
  /** public/journey/*.jpg 경로. 미연결이면 null */
  photo: string | null;
}

export const JOURNEY_ITEMS: JourneyItem[] = [
  {
    id: 'infant',
    label: '영유아기',
    period: '',
    caption: '',
    photo: null,
  },
  {
    id: 'toddler',
    label: '유아기',
    period: '',
    caption: '',
    photo: null,
  },
  {
    id: 'elementary',
    label: '초등기',
    period: '',
    caption: '',
    photo: null,
  },
  {
    id: 'graduation',
    label: '졸업식',
    period: '',
    caption: '',
    photo: null,
  },
  {
    id: 'young-adult',
    label: '청년기',
    period: '',
    caption: '',
    photo: null,
  },
  {
    id: 'recent',
    label: '최근',
    period: '',
    caption: '',
    photo: null,
  },
];
