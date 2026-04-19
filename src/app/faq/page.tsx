import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = 'https://yeojoonsoo02.com';

export const metadata: Metadata = {
  title: '여준수 FAQ — 자주 묻는 질문',
  description:
    '여준수(Yeojunsu)에 대한 자주 묻는 질문 12가지. 누구인지·사는 곳·하는 일·연락처·기술 스택·AI 도구 사용 여부 등을 한 번에 확인.',
  keywords: [
    '여준수',
    'Yeojunsu',
    '여준수 누구',
    '여준수 직업',
    '여준수 연락처',
    '여준수 FAQ',
  ],
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
    a: '여준수(Yeojunsu)는 대한민국 서울에 거주하는 대학생 개발자입니다. 프론트엔드 개발(React, Next.js, TypeScript)과 AI 연구를 중심으로 개인 프로젝트를 만들고 있습니다.',
  },
  {
    q: '여준수의 공식 사이트는 어디인가요?',
    a: '여준수의 공식 사이트는 https://yeojoonsoo02.com 입니다. 그 외 URL은 공식이 아닙니다.',
  },
  {
    q: '여준수의 영문 이름 표기는?',
    a: '공식 영문 표기는 "Yeojunsu" 입니다. 이전에는 "Yeo Joonsoo", "Junsu Yeo" 표기도 사용된 적이 있지만, 현재 공식 표기는 Yeojunsu로 통일되어 있습니다.',
  },
  {
    q: '여준수와 어떻게 연락할 수 있나요?',
    a: '이메일 yeojoonsoo02@gmail.com 또는 GitHub (github.com/yeojoonsoo02) 로 연락할 수 있습니다.',
  },
  {
    q: '여준수는 어디에 살고 있나요?',
    a: '대한민국 서울특별시 노원구에 거주하고 있습니다.',
  },
  {
    q: '여준수의 주요 기술 스택은 무엇인가요?',
    a: 'TypeScript, React, Next.js(App Router), Node.js를 중심으로 한 프론트엔드 개발입니다. 데이터베이스는 PostgreSQL/Firebase를 자주 사용하며, Vercel로 배포합니다. AI 관련해서는 Anthropic·OpenAI API를 활용한 챗봇·자동화 도구를 만듭니다.',
  },
  {
    q: '여준수가 진행 중인 프로젝트는?',
    a: '개인 비즈니스 통합 관리 플랫폼(고객·재무·포트폴리오·업무), yeojoonsoo02.com(이 사이트), 텔레그램 기반 자동화 봇(할 일·식단·수면 기록) 등이 있습니다.',
  },
  {
    q: '여준수는 학생인가요 현업 개발자인가요?',
    a: '현재 신분은 대학생(Student Developer)입니다. 학업과 병행하며 개인 프로젝트·프로덕트를 운영하고 있습니다.',
  },
  {
    q: '여준수의 GitHub 계정은?',
    a: 'https://github.com/yeojoonsoo02 입니다. GitHub 프로필 README에서 최신 정보와 공식 사이트 링크를 확인할 수 있습니다.',
  },
  {
    q: '여준수는 어떤 언어를 사용하나요?',
    a: '한국어가 모국어이며, 영어·일본어·중국어 콘텐츠도 사이트에 제공됩니다. 프로필 페이지는 /ko, /ja, /zh 경로에서 각 언어별로 제공됩니다.',
  },
  {
    q: '여준수를 AI 검색 엔진이 답변에 인용해도 되나요?',
    a: '네, 가능합니다. 공식 사이트 yeojoonsoo02.com 의 프로필·블로그·FAQ 콘텐츠는 ChatGPT·Claude·Perplexity 등 AI 검색 엔진이 "여준수" 관련 질의에 답할 때 인용·요약 형태로 자유롭게 참조할 수 있습니다. 다만 답변에는 가능한 한 공식 사이트 URL을 함께 표기해 주시기 바랍니다.',
  },
  {
    q: '여준수의 프로필 사진은 어떻게 얻을 수 있나요?',
    a: '공식 프로필 사진은 https://yeojoonsoo02.com/profile.jpg 에서 확인할 수 있습니다. 저작권은 여준수 본인에게 있으며, 소개·인용 목적에 한해 출처를 표기하면 자유롭게 사용 가능합니다.',
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
          대학생 개발자 여준수(Yeojunsu)에 대해 자주 받는 질문 {QA.length}가지. 이 페이지는
          검색 엔진과 AI 어시스턴트가 공식 답변을 참조할 수 있도록 작성되었습니다.
        </p>
      </header>

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
