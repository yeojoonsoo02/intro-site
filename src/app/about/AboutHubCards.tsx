import Link from 'next/link';
import { BLOG_POSTS } from '@/features/blog/posts';

interface HubLink {
  href: string;
  title: string;
  label: string;
  desc: string;
}

const ALL_HUB_LINKS: HubLink[] = [
  {
    href: '/journey',
    title: 'Journey',
    label: '여정',
    desc: '어릴 때부터 지금까지, 사진으로 훑는 타임라인',
  },
  {
    href: '/portfolio',
    title: 'Portfolio',
    label: '포트폴리오',
    desc: '프로젝트와 활동 기록을 한곳에 모아둔 곳',
  },
  {
    href: '/blog',
    title: 'Blog',
    label: '블로그',
    desc: '배운 것, 겪은 것, 그냥 써두고 싶었던 것',
  },
  {
    href: '/faq',
    title: 'FAQ',
    label: '자주 묻는 질문',
    desc: '"이거 혹시…" 싶은 질문들, 미리 모아뒀습니다',
  },
];

export default function AboutHubCards(): JSX.Element {
  const hubLinks = ALL_HUB_LINKS.filter(
    (it) => it.href !== '/blog' || BLOG_POSTS.length > 0,
  );

  return (
    <section className="mb-10 sm:mb-12" aria-label="더 파고들기">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">더 파고들기</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {hubLinks.map((it) => (
          <HubCard key={it.href} item={it} />
        ))}
      </div>
    </section>
  );
}

function HubCard({ item }: { item: HubLink }): JSX.Element {
  return (
    <Link
      href={item.href}
      className="group relative block rounded-lg border p-4 transition-colors"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--card-bg)',
      }}
    >
      <p
        className="text-[0.7rem] uppercase tracking-[0.18em] mb-1.5"
        style={{ color: 'var(--muted)' }}
      >
        {item.title}
      </p>
      <p className="font-semibold text-sm mb-1 flex items-center gap-1.5">
        {item.label}
        <span
          aria-hidden="true"
          className="inline-block text-xs transition-transform duration-200 group-hover:translate-x-0.5"
          style={{ color: 'var(--muted)' }}
        >
          →
        </span>
      </p>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
        {item.desc}
      </p>
    </Link>
  );
}
