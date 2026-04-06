import { NextRequest, NextResponse } from 'next/server';

interface GithubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
  fork: boolean;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const user = req.nextUrl.searchParams.get('user') || 'yeojoonsoo02';

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${user}`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
        next: { revalidate: 3600 },
      }),
      fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=30`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
        next: { revalidate: 3600 },
      }),
    ]);

    if (!userRes.ok || !reposRes.ok) {
      return NextResponse.json({ error: 'GitHub API failed' }, { status: 502 });
    }

    const userData = await userRes.json();
    const reposData: GithubRepo[] = await reposRes.json();

    const repos = reposData
      .filter((r) => !r.fork)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 6)
      .map((r) => ({
        name: r.name,
        description: r.description,
        html_url: r.html_url,
        stargazers_count: r.stargazers_count,
        language: r.language,
        updated_at: r.updated_at,
      }));

    return NextResponse.json({
      publicRepos: userData.public_repos,
      repos,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 });
  }
}
