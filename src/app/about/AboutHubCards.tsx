import Link from 'next/link';
import { getLabels } from './labels';

// 카드 설명은 로케일 JSON에 없다. 지어내지 않고 확실한 두 언어만 둔다.
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
export default function AboutHubCards({ lang }: { lang: string }): JSX.Element {
  const t = getLabels(lang);
  const desc = DESCRIPTIONS[lang];
  const items = [
    { href: '/journey', title: 'Journey', label: t('journey', 'Journey'), desc: desc?.journey ?? '' },
    { href: '/portfolio', title: 'Portfolio', label: t('portfolio', 'Portfolio'), desc: desc?.portfolio ?? '' },
  ];

  return (
    <section className="mb-10 sm:mb-12" aria-label={t('about')}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative block rounded-lg border p-4 transition-colors"
            style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
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
                &rarr;
              </span>
            </p>
            {item.desc && (
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                {item.desc}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
