import { Gowun_Dodum, Nunito } from 'next/font/google';

// 말풍선용 둥근 글꼴. 영문은 Nunito, 한글은 고운돋움 — 이 페이지(영어 룸메이트 설명·데모)에서만 쓴다.
// 고운돋움은 한글 조각이 많아 미리 불러오지 않는다(preload: false). 글꼴이 늦으면 Pretendard로 먼저 보인다.

export const roundLatin = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-rm-round',
});

export const roundKo = Gowun_Dodum({
  weight: '400',
  display: 'swap',
  preload: false,
  variable: '--font-rm-ko',
});

export const storyFontVars = `${roundLatin.variable} ${roundKo.variable}`;
