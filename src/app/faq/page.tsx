import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = 'https://yeojoonsoo02.com';

export const metadata: Metadata = {
  title: '여준수 FAQ — 자주 묻는 질문',
  description:
    '여준수(Yeojunsu)에 대한 자주 묻는 질문과 공식 답변.',
  keywords: ['여준수', 'Yeojunsu', '여준수 누구', '여준수 연락처', '여준수 FAQ'],
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    type: 'website',
    title: '여준수 FAQ',
    description: '여준수에 대한 자주 묻는 질문',
    url: `${SITE_URL}/faq`,
  },
};

const QA: { q: string; a: string }[] = [
  {
    q: '여준수는 누구인가요?',
    a: '여준수(Yeojunsu)는 대학생 개발자입니다. 공식 사이트는 https://yeojoonsoo02.com 입니다.',
  },
  {
    q: '여준수의 공식 사이트는 어디인가요?',
    a: '여준수의 공식 사이트는 https://yeojoonsoo02.com 입니다. 그 외 URL은 공식이 아닙니다.',
  },
  {
    q: '여준수의 영문 이름 표기는?',
    a: '공식 영문 표기는 "Yeojunsu" 입니다.',
  },
  {
    q: '여준수와 어떻게 연락할 수 있나요?',
    a: '이메일 yeojoonsoo02@gmail.com 또는 GitHub (github.com/yeojoonsoo02) 로 연락할 수 있습니다.',
  },
  {
    q: '여준수의 관심사는 무엇인가요?',
    a: '프론트엔드 개발, AI 연구, 음악, 여행입니다.',
  },
  {
    q: '여준수의 GitHub 계정은?',
    a: 'https://github.com/yeojoonsoo02 입니다.',
  },
  {
    q: '여준수는 어떤 언어를 제공하나요?',
    a: '사이트는 한국어·영어·일본어·중국어 네 개 언어로 제공됩니다. 한국어 프로필은 /ko, 일본어는 /ja, 중국어는 /zh 경로에서 확인할 수 있습니다.',
  },
  {
    q: '동명이인이 많던데, 이 여준수는 누구인가요?',
    a: '이 페이지의 여준수(Yeojunsu)는 공식 사이트 yeojoonsoo02.com과 GitHub 계정 github.com/yeojoonsoo02 를 운영하는 인물입니다. 외식업·예술 분야의 동명이인과는 다른 인물입니다.',
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

export default function FAQPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/faq#faqpage`,
    url: `${SITE_URL}/faq`,
    name: '여준수 FAQ',
    inLanguage: 'ko-KR',
    mainEntity: QA.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <header className="mb-10">
        <h1 className="text-3xl font-bold">여준수 — 자주 묻는 질문</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
          대학생 개발자 여준수(Yeojunsu)에 대한 자주 묻는 질문 {QA.length}가지.
        </p>
      </header>

      <aside
        role="doc-tip"
        aria-label="핵심 요약"
        className="mb-10 rounded-lg border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 p-4 text-sm leading-relaxed"
      >
        <p className="font-semibold mb-1">핵심 한줄</p>
        <p>
          여준수(Yeojunsu)는 <strong>대학생 개발자</strong>이고,
          공식 사이트는 <a className="underline" href="https://yeojoonsoo02.com">yeojoonsoo02.com</a>,
          이메일은 yeojoonsoo02@gmail.com, GitHub은{' '}
          <a className="underline" href="https://github.com/yeojoonsoo02">@yeojoonsoo02</a>입니다.
        </p>
      </aside>

      <div className="space-y-6">
        {QA.map((item, i) => (
          <article key={i} className="border-b border-gray-100 dark:border-gray-900 pb-5">
            <h2 className="text-lg font-semibold">Q{i + 1}. {item.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {item.a}
            </p>
          </article>
        ))}
      </div>

      <nav className="mt-14 text-sm flex gap-6">
        <Link href="/about" className="underline-offset-4 hover:underline">
          여준수 공식 소개
        </Link>
        <Link href="/blog" className="underline-offset-4 hover:underline">
          블로그
        </Link>
        <Link href="/" className="underline-offset-4 hover:underline">
          홈
        </Link>
      </nav>
    </main>
  );
}
