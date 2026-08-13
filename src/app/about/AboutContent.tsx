import Image from 'next/image';
import Link from 'next/link';
import SocialLinks from '@/features/social/SocialLinks';
import { SITE_MODIFIED } from '@/components/seo/schemas/constants';
import AboutHubCards from './AboutHubCards';
import { AboutWhy, AboutSummary } from './AboutFacts';
import AboutInterests from './AboutInterests';
import AboutChatCta from './AboutChatCta';
import { getAboutData } from './aboutData';
import { getLabels } from './labels';
import { getFactLabels } from './factLabels';

const mutedStyle = { color: 'var(--muted)' } as const;

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
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <header className="mb-8 sm:mb-10 flex items-start gap-4 sm:gap-5">
        {/* 자기소개 페이지인데 얼굴이 없었다. 랜딩·OG에만 쓰이던 사진을 여기에도 둔다. */}
        <Image
          src={profile.photo || '/profile.jpg'}
          alt={profile.name}
          width={72}
          height={72}
          className="rounded-full object-cover shrink-0"
          style={{ border: '1px solid var(--border)' }}
        />
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{heading}</h1>
          <p
            className="summary mt-3 text-[0.95rem] sm:text-base leading-[1.7]"
            style={mutedStyle}
          >
            {intro}
          </p>
        </div>
      </header>

      <AboutChatCta label={t('chatInvite')} />

      <AboutHubCards lang={lang} />

      <section className="facts space-y-10">
        <AboutSummary profile={profile} lang={lang} education={data.education} />

        {data.skills.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3">{t('techStack')}</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 sm:gap-x-6 gap-y-2 text-sm leading-[1.7] overflow-wrap-anywhere">
              {data.skills.map((cat) => (
                <div key={cat.name} className="contents">
                  <dt style={mutedStyle}>{cat.name}</dt>
                  <dd>{cat.items.join(' · ')}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* 실제 고객의 말이 대학생 개발자 소개에서 가장 강한 근거인데 묻혀 있었다. */}
        {data.testimonials.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3">{t('testimonials')}</h2>
            <ul className="space-y-3">
              {data.testimonials.map((item) => (
                <li
                  key={item.content}
                  className="rounded-lg border p-3.5 text-sm leading-[1.7]"
                  style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
                >
                  <p>{item.content}</p>
                  <p className="mt-2 text-xs" style={mutedStyle}>
                    {[item.name, item.role].filter(Boolean).join(' · ')}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <AboutWhy
          profile={profile}
          lang={lang}
          proseShownElsewhere={data.values.length > 0 || data.goals.length > 0}
        />

        {data.values.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3">{t('valuesMindset')}</h2>
            <ul className="space-y-2 text-sm leading-[1.7]">
              {data.values.map((v) => (
                <li
                  key={v}
                  className="pl-3"
                  style={{ borderLeft: '2px solid var(--border)' }}
                >
                  {v}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.goals.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3">{t('goalsVision')}</h2>
            <ul className="space-y-2 text-sm leading-[1.7]">
              {data.goals.map((g) => (
                <li
                  key={g}
                  className="pl-3"
                  style={{ borderLeft: '2px solid var(--border)' }}
                >
                  {g}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.certifications.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3">{t('certifications')}</h2>
            <ul className="space-y-1.5 text-sm leading-[1.7]">
              {data.certifications.map((c) => (
                <li key={c.name}>
                  {c.name}
                  {c.issuer && <span style={mutedStyle}> · {c.issuer}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <AboutInterests interests={profile.interests} lang={lang} />

        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3">{t('contact')}</h2>
          <SocialLinks colored isDev={false} />
        </div>
      </section>

      <footer className="mt-12 sm:mt-14 flex items-center justify-between gap-4 text-sm">
        <Link
          href={lang === 'ko' ? '/' : `/${lang}`}
          className="underline-offset-4 hover:underline"
          style={mutedStyle}
        >
          ← {t('goHome')}
        </Link>
        {/* "지금도 활동하나?"를 판단할 근거. 날짜만 두면 무슨 날짜인지 알 수 없어 라벨을 붙인다. */}
        <p className="text-xs" style={mutedStyle}>
          {L.updated}{' '}
          <time dateTime={SITE_MODIFIED}>{SITE_MODIFIED}</time>
        </p>
      </footer>
    </main>
  );
}
