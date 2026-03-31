import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const lang = req.nextUrl.searchParams.get('lang') || 'ko';

  if (!adminDb) {
    return NextResponse.json({ error: 'Admin SDK not available' }, { status: 500 });
  }

  const col = adminDb.collection('portfolio');

  const [heroSnap, summarySnap, projectsSnap, skillsSnap, timelineSnap] =
    await Promise.allSettled([
      col.doc(`hero_${lang}`).get(),
      col.doc(`summary_${lang}`).get(),
      col.doc(`projects_${lang}`).get(),
      col.doc(`skills_${lang}`).get(),
      col.doc(`timeline_${lang}`).get(),
    ]);

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

  return NextResponse.json({ hero, summary, projects, skills, timeline });
}
