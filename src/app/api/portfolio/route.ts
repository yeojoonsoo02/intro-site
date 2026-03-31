import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const lang = req.nextUrl.searchParams.get('lang') || 'ko';

  if (!adminDb) {
    return NextResponse.json({ error: 'Admin SDK not available', debug: 'adminDb is null' }, { status: 500 });
  }

  try {
    const col = adminDb.collection('portfolio');

    const [heroSnap, summarySnap, projectsSnap, skillsSnap, timelineSnap] =
      await Promise.allSettled([
        col.doc(`hero_${lang}`).get(),
        col.doc(`summary_${lang}`).get(),
        col.doc(`projects_${lang}`).get(),
        col.doc(`skills_${lang}`).get(),
        col.doc(`timeline_${lang}`).get(),
      ]);

    const debug = {
      hero: heroSnap.status === 'fulfilled' ? `exists:${heroSnap.value.exists}` : `rejected:${(heroSnap as PromiseRejectedResult).reason}`,
      summary: summarySnap.status === 'fulfilled' ? `exists:${summarySnap.value.exists}` : `rejected:${(summarySnap as PromiseRejectedResult).reason}`,
      projects: projectsSnap.status === 'fulfilled' ? `exists:${projectsSnap.value.exists}` : `rejected:${(projectsSnap as PromiseRejectedResult).reason}`,
      skills: skillsSnap.status === 'fulfilled' ? `exists:${skillsSnap.value.exists}` : `rejected:${(skillsSnap as PromiseRejectedResult).reason}`,
      timeline: timelineSnap.status === 'fulfilled' ? `exists:${timelineSnap.value.exists}` : `rejected:${(timelineSnap as PromiseRejectedResult).reason}`,
    };

    const hero =
      heroSnap.status === 'fulfilled' && heroSnap.value.exists
        ? heroSnap.value.data()
        : null;
    const summary =
      summarySnap.status === 'fulfilled' && summarySnap.value.exists
        ? summarySnap.value.data()
        : null;
    const projects =
      projectsSnap.status === 'fulfilled' && projectsSnap.value.exists
        ? (projectsSnap.value.data()?.items ?? [])
        : [];
    const skills =
      skillsSnap.status === 'fulfilled' && skillsSnap.value.exists
        ? (skillsSnap.value.data()?.categories ?? [])
        : [];
    const timeline =
      timelineSnap.status === 'fulfilled' && timelineSnap.value.exists
        ? (timelineSnap.value.data()?.items ?? [])
        : [];

    return NextResponse.json({ hero, summary, projects, skills, timeline, _debug: debug });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
