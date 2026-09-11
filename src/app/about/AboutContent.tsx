import Image from 'next/image';
import Link from 'next/link';
import SocialLinks from '@/features/social/SocialLinks';
import ChatCtaButton from '@/features/prompt/ChatCtaButton';
import { SITE_MODIFIED } from '@/components/seo/schemas/constants';
import AboutHubCards from './AboutHubCards';
import { AboutWhy, AboutSummary } from './AboutFacts';
import AboutInterests from './AboutInterests';
import AboutRecentPosts from './AboutRecentPosts';
import { getAboutData } from './aboutData';
import { getLabels } from './labels';
import { getFactLabels } from './factLabels';
import { AboutSectionTitle } from './SectionTitle';

const mutedStyle = { color: 'var(--muted)' } as const;
const inkStyle2 = { color: 'var(--ink-2)' } as const;

// 날짜를 ISO 그대로 두면 언어별 읽는 방식과 어긋난다. <time>의 dateTime엔 ISO를 유지하고
// 눈에 보이는 값만 로케일 형식으로 바꾼다.
function formatDate(iso: string, lang: string): string {
  try {
    return new Intl.DateTimeFormat(lang === 'ko' ? 'ko-KR' : lang, {
      dateStyle: 'long',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

interface AboutContentProps {
  lang: string;
  heading: string;
  intro: string;
}

export default async function AboutContent({
  lang,
  heading,
  intro,
}: AboutContentProps): Promise<JSX.Element> {
  const data = await getAboutData(lang);
  const t = getLabels(lang);
  const L = getFactLabels(lang);
  const { profile } = data;

  return (
    <main className="max-w-2xl mx-auto px-5 sm:px-6 pt-20 sm:pt-28 pb-16">
      <header className="mb-10 sm:mb-12 grid grid-cols-[1fr_auto] gap-x-6 gap-y-4 items-start">
        <div className="min-w-0">
          <h1 className="font-serif text-[2rem] sm:text-[2.5rem] leading-[1.15]">{heading}</h1>
          <p className="summary mt-4 text-[1.0625rem] leading-[1.7]" style={inkStyle2}>
            {intro}
          </p>
        </div>
        {/* 자기소개 페이지인데 얼굴이 없었다. 랜딩·OG에만 쓰이던 사진을 여기에도 둔다. */}
        <Image
          src={profile.photo || '/profile.jpg'}
          alt={profile.name}
          width={88}
          height={88}
          className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] object-cover shrink-0"
          style={{ borderRadius: 'var(--r-lg)', border: '1px solid var(--rule)' }}
        />
        <div className="col-span-2 pt-1">
          <ChatCtaButton label={t('chatInvite')} variant="ghost" />
        </div>
      </header>

      <AboutHubCards lang={lang} />

      <section className="facts space-y-12 sm:space-y-14">
        <AboutSummary profile={profile} lang={lang} education={data.education} />

        {/* 요약 바로 다음에 둔다 — "지금도 활동 중"이라는 신호는 이력 나열보다 먼저 와야
            효과가 있다. 외부 RSS라 실패하면 컴포넌트가 스스로 null을 반환해 사라진다. */}
        <AboutRecentPosts lang={lang} />

        {data.skills.length > 0 && (
          <div>
            <AboutSectionTitle>{t('techStack')}</AboutSectionTitle>
            <dl className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-base leading-[1.7]">
              {data.skills.map((cat) => (
                <div key={cat.name} className="contents">
                  <dt className="meta sm:pt-[3px]">{cat.name}</dt>
                  <dd>{cat.items.join(' · ')}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <AboutWhy
          profile={profile}
          lang={lang}
          proseShownElsewhere={data.values.length > 0 || data.goals.length > 0}
        />

        {data.values.length > 0 && (
          <div>
            <AboutSectionTitle>{t('valuesMindset')}</AboutSectionTitle>
            <ul className="space-y-3 text-base leading-[1.75] max-w-[62ch]">
              {data.values.map((v) => (
                <li key={v} className="intro-p">
                  {v}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.goals.length > 0 && (
          <div>
            <AboutSectionTitle>{t('goalsVision')}</AboutSectionTitle>
            <ol className="space-y-3 text-base leading-[1.75] max-w-[62ch] list-none">
              {data.goals.map((g, i) => (
                <li key={g} className="grid grid-cols-[2.25rem_1fr] gap-x-2">
                  <span className="meta pt-[3px]">{String(i + 1).padStart(2, '0')}</span>
                  <span>{g}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <AboutInterests interests={profile.interests} lang={lang} />

        <div>
          <AboutSectionTitle>{t('contact')}</AboutSectionTitle>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
            <a className="link-u text-[1.0625rem]" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <div className="-mt-3 sm:mt-0"><SocialLinks colored /></div>
          </div>
        </div>
      </section>

      <footer
        className="mt-14 pt-6 flex items-center justify-between gap-4 text-[0.9375rem]"
        style={{ borderTop: '1px solid var(--rule)' }}
      >
        <Link href={lang === 'ko' ? '/' : `/${lang}`} className="link-u" style={inkStyle2}>
          ← {t('goHome')}
        </Link>
        {/* "지금도 활동하나?"를 판단할 근거. 날짜만 두면 무슨 날짜인지 알 수 없어 라벨을 붙인다. */}
        <p className="meta" style={mutedStyle}>
          {L.updated}{' '}
          <time dateTime={SITE_MODIFIED}>{formatDate(SITE_MODIFIED, lang)}</time>
        </p>
      </footer>
    </main>
  );
}
