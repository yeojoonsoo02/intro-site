import type { Metadata } from 'next';
import Link from 'next/link';
import { FAQ } from '@/data/faq';

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

export default function FAQPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/faq#faqpage`,
    url: `${SITE_URL}/faq`,
    name: '여준수 FAQ',
    inLanguage: 'ko-KR',
    mainEntity: FAQ.map((item) => ({
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
          대학생 개발자 여준수(Yeojunsu)에 대한 자주 묻는 질문 {FAQ.length}가지.
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
        {FAQ.map((item, i) => (
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
