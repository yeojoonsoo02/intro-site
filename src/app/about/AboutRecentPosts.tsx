import { getRecentPosts } from '@/lib/blogContext';
import { getLabels } from './labels';

// 네이버 블로그 "타발추"의 최근 글을 /about에 노출한다.
//
// 왜: 사이트가 정지된 이력서로 읽혔다. 마지막 글 날짜가 보이면 "지금도 쓰는 사람"이
// 한 줄로 전달되고, 서평 제목은 관심사를 주장이 아니라 기록으로 보여준다.
//
// 무엇을 내보내는가: 제목·날짜·링크만. 일기 본문은 가족·지인 실명이 섞여 있어
// blogContext가 애초에 가져오지 않는다. 발췌는 공개 서평('책')에만 붙는다.

const BLOG_URL = 'https://blog.naver.com/yeojoonsoo02';
const BOOK_CATEGORY = '책';

const mutedStyle = { color: 'var(--muted)' } as const;

// 목록이라 연/월/일 전체는 과하다. 로케일 형식은 유지하되 짧게.
function formatShortDate(iso: string, lang: string): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(lang === 'ko' ? 'ko-KR' : lang, {
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

interface AboutRecentPostsProps {
  lang: string;
}

export default async function AboutRecentPosts({
  lang,
}: AboutRecentPostsProps): Promise<JSX.Element | null> {
  const posts = await getRecentPosts();
  // RSS 장애 중에는 섹션을 통째로 숨긴다. 빈 제목만 남은 목록보다 없는 편이 낫다.
  if (posts.length === 0) return null;

  const t = getLabels(lang);

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold mb-3">{t('recentPosts')}</h2>

      {/* 글은 한국어로 쓰여 있다. 로케일과 무관하게 lang을 명시해 스크린리더·줄바꿈이
          한국어 규칙을 따르게 한다. */}
      <ul className="space-y-3.5 text-sm leading-[1.7]" lang="ko">
        {posts.map((post) => (
          <li
            key={post.link}
            className="pl-3"
            style={{ borderLeft: '2px solid var(--border)' }}
          >
            <a
              href={post.link}
              target="_blank"
              // noreferrer는 넣지 않는다 — 블로그 유입 통계에서 이 사이트가 출처로 잡혀야 한다.
              rel="noopener"
              className="underline-offset-4 hover:underline"
              style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
            >
              {post.title}
            </a>
            <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-xs" style={mutedStyle}>
              {post.date && (
                <time dateTime={post.date} className="tabular-nums">
                  {formatShortDate(post.date, lang)}
                </time>
              )}
              <span lang={lang}>
                {post.category === BOOK_CATEGORY ? t('blogCategoryBook') : t('blogCategoryDaily')}
              </span>
            </p>
            {post.snippet && (
              <p className="mt-1 text-xs leading-[1.6]" style={mutedStyle}>
                {post.snippet}…
              </p>
            )}
          </li>
        ))}
      </ul>

      <a
        href={BLOG_URL}
        target="_blank"
        rel="noopener"
        className="mt-3.5 inline-block text-sm underline-offset-4 hover:underline"
        style={mutedStyle}
        lang={lang}
      >
        {t('recentPostsMore')} →
      </a>
    </div>
  );
}
