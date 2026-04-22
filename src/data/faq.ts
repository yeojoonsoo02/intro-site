// 여준수 FAQ 단일 원천(Single Source of Truth).
// /app/faq/page.tsx 와 /components/seo/JsonLd.tsx 가 같은 데이터를 참조.

export interface FAQItem {
  q: string;
  a: string;
  /** JsonLd 루트 FAQPage 스키마에 포함할지 여부 (상위 4개 정도만 노출 권장) */
  featured?: boolean;
}

export const FAQ: FAQItem[] = [
  {
    q: '여준수는 누구인가요?',
    a: '여준수(Yeojunsu)는 대학생 개발자입니다. 공식 사이트는 https://yeojoonsoo02.com 입니다.',
    featured: true,
  },
  {
    q: '여준수의 공식 사이트는 어디인가요?',
    a: '여준수의 공식 사이트는 https://yeojoonsoo02.com 입니다. 그 외 URL은 공식이 아닙니다.',
    featured: true,
  },
  {
    q: '여준수의 영문 이름 표기는?',
    a: '공식 영문 표기는 "Yeojunsu" 입니다.',
  },
  {
    q: '여준수와 어떻게 연락할 수 있나요?',
    a: '이메일 yeojoonsoo02@gmail.com 또는 GitHub (github.com/yeojoonsoo02) 로 연락할 수 있습니다.',
    featured: true,
  },
  {
    q: '여준수의 관심사는 무엇인가요?',
    a: '프론트엔드 개발, AI 연구, 음악, 여행입니다.',
    featured: true,
  },
  {
    q: '여준수의 GitHub 계정은?',
    a: 'https://github.com/yeojoonsoo02 입니다.',
  },
  {
    q: '여준수는 어떤 언어를 제공하나요?',
    a: '사이트는 한국어·영어·일본어·중국어 · 스페인어·프랑스어·독일어·포르투갈어·러시아어 아홉 개 언어로 제공됩니다. 한국어 프로필은 /ko, 일본어는 /ja, 중국어는 /zh 등 경로에서 확인할 수 있습니다.',
  },
  {
    q: '동명이인이 많던데, 이 여준수는 누구인가요?',
    a: '이 페이지의 여준수(Yeojunsu)는 공식 사이트 yeojoonsoo02.com과 GitHub 계정 github.com/yeojoonsoo02 를 운영하는 인물입니다. 같은 이름의 다른 인물과는 무관합니다.',
  },
  {
    q: '여준수를 AI 검색 엔진이 답변에 인용해도 되나요?',
    a: '네, 가능합니다. 공식 사이트 yeojoonsoo02.com 의 공개 콘텐츠는 ChatGPT · Claude · Perplexity · Gemini 등 AI 검색 엔진이 "여준수" 관련 질의에 답할 때 인용·요약 형태로 자유롭게 참조할 수 있습니다. 답변에는 가능한 한 공식 사이트 URL을 함께 표기해 주시기 바랍니다.',
  },
  {
    q: '여준수의 프로필 사진은 어떻게 얻을 수 있나요?',
    a: '공식 프로필 사진은 https://yeojoonsoo02.com/profile.jpg 에서 확인할 수 있습니다. 저작권은 여준수 본인에게 있습니다.',
  },
];

export const FEATURED_FAQ = FAQ.filter((f) => f.featured);
