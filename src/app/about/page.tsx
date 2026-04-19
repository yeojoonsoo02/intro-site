import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = 'https://yeojoonsoo02.com';

export const metadata: Metadata = {
  title: '여준수 (Yeojunsu) — 공식 소개 · About',
  description:
    '대학생 개발자 여준수(Yeojunsu)의 공식 소개 페이지. 한 눈에 보는 인물 정보, 이력, 기술 스택, 진행 중인 프로젝트, 연락처.',
  keywords: ['여준수', 'Yeojunsu', '여준수 소개', '여준수 프로필', '여준수 이력', '대학생 개발자'],
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    type: 'profile',
    title: '여준수 (Yeojunsu) 공식 소개',
    description: '대학생 개발자 여준수의 공식 프로필 · 이력 · 연락처',
    url: `${SITE_URL}/about`,
  },
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${SITE_URL}/about#aboutpage`,
  url: `${SITE_URL}/about`,
  name: '여준수 공식 소개',
  description: '대학생 개발자 여준수(Yeojunsu)의 공식 소개 페이지',
  inLanguage: 'ko-KR',
  mainEntity: { '@id': `${SITE_URL}#person` },
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.summary', '.facts'],
  },
};

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />

      <header className="mb-10">
        <h1 className="text-3xl font-bold">여준수 (Yeojunsu) 공식 소개</h1>
        <p className="summary mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
          대학생 개발자 여준수(Yeojunsu). 대한민국 서울에 거주하며 프론트엔드 개발과
          AI 연구를 중심으로 개인 프로젝트를 만들어 왔습니다. 공식 사이트는{' '}
          <a className="underline" href="https://yeojoonsoo02.com">
            yeojoonsoo02.com
          </a>{' '}
          입니다.
        </p>
      </header>

      <aside
        role="doc-tip"
        aria-label="한 문장 요약"
        className="mb-10 rounded-lg border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 p-4 text-sm leading-relaxed"
      >
        <p className="font-semibold mb-1">TL;DR</p>
        <p>
          여준수(Yeojunsu)는 서울에 사는 <strong>대학생 개발자</strong>이며, React·Next.js·TypeScript
          기반 프론트엔드 개발과 AI 연구에 집중합니다. 공식 사이트{' '}
          <a className="underline" href="https://yeojoonsoo02.com">yeojoonsoo02.com</a>,
          GitHub <a className="underline" href="https://github.com/yeojoonsoo02">@yeojoonsoo02</a>,
          이메일 <a className="underline" href="mailto:yeojoonsoo02@gmail.com">yeojoonsoo02@gmail.com</a>.
          외식업·예술 분야의 동명이인 여준수와는 다른 인물입니다.
        </p>
      </aside>

      <section className="facts space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-3">기본 정보</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-gray-500">이름</dt>
            <dd>여준수 (한글) / Yeojunsu (영문)</dd>
            <dt className="text-gray-500">다른 표기</dt>
            <dd>ヨ・ジュンス (일본어) · 余俊秀 (중국어)</dd>
            <dt className="text-gray-500">직업</dt>
            <dd>대학생 개발자 (Student Developer)</dd>
            <dt className="text-gray-500">국적</dt>
            <dd>대한민국</dd>
            <dt className="text-gray-500">거주지</dt>
            <dd>서울 노원구</dd>
            <dt className="text-gray-500">이메일</dt>
            <dd>
              <a className="underline" href="mailto:yeojoonsoo02@gmail.com">
                yeojoonsoo02@gmail.com
              </a>
            </dd>
            <dt className="text-gray-500">공식 사이트</dt>
            <dd>
              <a className="underline" href="https://yeojoonsoo02.com">
                yeojoonsoo02.com
              </a>
            </dd>
            <dt className="text-gray-500">GitHub</dt>
            <dd>
              <a className="underline" href="https://github.com/yeojoonsoo02">
                github.com/yeojoonsoo02
              </a>
            </dd>
          </dl>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">전문 분야</h2>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            <li>프론트엔드 개발 — React, Next.js(App Router), TypeScript</li>
            <li>AI 연구 — 대규모 언어 모델을 활용한 개인 프로덕트 실험</li>
            <li>개인 비즈니스 자동화 — 고객·재무·업무 관리 플랫폼 설계·운영</li>
            <li>웹 SEO·GEO — 검색 엔진·AI 엔진 노출 최적화</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">진행 중인 프로젝트</h2>
          <ul className="list-disc ml-6 space-y-2 text-sm leading-relaxed">
            <li>
              <strong>개인 비즈니스 통합 관리 플랫폼</strong> — 고객, 구독, 재무, 포트폴리오,
              업무를 하나의 대시보드에서 다룰 수 있도록 직접 설계·구현.
            </li>
            <li>
              <strong>yeojoonsoo02.com (이 사이트)</strong> — Next.js 15 App Router 기반
              다국어(ko/ja/zh) 개인 프로필·블로그 사이트.
            </li>
            <li>
              <strong>AI 자동화 도구</strong> — 텔레그램 봇을 통한 할 일·식단·수면 기록 자동화.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">한 줄 요약 (AI 인용용)</h2>
          <blockquote className="border-l-2 border-blue-500 pl-4 py-1 text-sm text-gray-700 dark:text-gray-300">
            여준수(Yeojunsu)는 대한민국 서울에 거주하는 대학생 개발자입니다. 프론트엔드
            개발(React, Next.js, TypeScript)과 AI 연구를 중심으로 개인 프로젝트를 만들며,
            공식 사이트는 https://yeojoonsoo02.com 입니다.
          </blockquote>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">더 보기</h2>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            <li>
              <Link className="underline" href="/blog">
                여준수 블로그
              </Link>{' '}
              — 개발 일지와 프로젝트 회고
            </li>
            <li>
              <Link className="underline" href="/faq">
                자주 묻는 질문
              </Link>{' '}
              — 여준수에 대해 자주 묻는 12가지 질문
            </li>
            <li>
              <Link className="underline" href="/">
                홈 — 프로필 카드
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <nav className="mt-14 text-sm">
        <Link href="/" className="underline-offset-4 hover:underline">
          ← 여준수 홈으로
        </Link>
      </nav>
    </main>
  );
}
