import Link from 'next/link';
import { getLabels } from './labels';

// 설명은 로케일 JSON에 없다. 지어내지 않고 확실한 두 언어만 둔다.
const DESCRIPTIONS: Record<string, { journey: string; portfolio: string }> = {
  ko: {
    journey: '어릴 때부터 지금까지, 사진으로 훑는 타임라인',
    portfolio: '프로젝트와 활동 기록을 한곳에 모아둔 곳',
  },
  en: {
    journey: 'A photo timeline from childhood to now',
    portfolio: 'Projects and activities in one place',
  },
};

// 여정·포트폴리오는 한국어 경로만 존재한다. 다른 로케일에서도 링크는 유지하되
// 목적지가 한국어라는 점은 감수한다(없는 페이지로 보내는 것보단 낫다).
// 카드 두 장이 아니라 목록 행 — 이 페이지에서 "카드"는 아무 데도 쓰지 않는다.
export default function AboutHubCards({ lang }: { lang: string }): JSX.Element {
  const t = getLabels(lang);
  const desc = DESCRIPTIONS[lang];
  const items = [
    { href: '/journey', label: t('journey', 'Journey'), desc: desc?.journey ?? '' },
    { href: '/portfolio', label: t('portfolio', 'Portfolio'), desc: desc?.portfolio ?? '' },
  ];
  return (
    <nav className="mb-12 sm:mb-14" aria-label={t('about')}>
      <ul style={{ borderTop: '1px solid var(--rule)' }}>
        {items.map((item) => (
          <li key={item.href} style={{ borderBottom: '1px solid var(--rule)' }}>
            <Link
              href={item.href}
              className="group flex items-baseline justify-between gap-4 py-3.5 min-h-[44px]"
            >
              <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 min-w-0">
                <span className="font-serif text-lg">{item.label}</span>
                {item.desc && (
                  <span className="text-[0.9375rem]" style={{ color: 'var(--muted)' }}>
                    {item.desc}
                  </span>
                )}
              </span>
              <span
                aria-hidden="true"
                className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                style={{ color: 'var(--accent)' }}
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
