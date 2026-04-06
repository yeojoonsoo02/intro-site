import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

const ALLOWED_LANGS = ['ko', 'en', 'ja', 'zh'];

export async function GET(req: NextRequest): Promise<NextResponse> {
  const rawLang = req.nextUrl.searchParams.get('lang') || 'ko';
  const lang = ALLOWED_LANGS.includes(rawLang) ? rawLang : 'ko';

  if (!adminDb) {
    return NextResponse.json({ error: 'Admin SDK not available' }, { status: 500 });
  }

  const col = adminDb.collection('portfolio');
  const [heroSnap, summarySnap, skillsSnap, projectsSnap, timelineSnap, eduSnap, certSnap] =
    await Promise.all([
      col.doc(`hero_${lang}`).get(),
      col.doc(`summary_${lang}`).get(),
      col.doc(`skills_${lang}`).get(),
      col.doc(`projects_${lang}`).get(),
      col.doc(`timeline_${lang}`).get(),
      col.doc(`education_${lang}`).get(),
      col.doc(`certifications_${lang}`).get(),
    ]);

  const hero = heroSnap.exists ? heroSnap.data() : null;
  const summary = summarySnap.exists ? summarySnap.data() : null;
  const skills = skillsSnap.exists ? (skillsSnap.data()?.categories ?? []) : [];
  const projects = projectsSnap.exists ? (projectsSnap.data()?.items ?? []) : [];
  const timeline = timelineSnap.exists ? (timelineSnap.data()?.items ?? []) : [];
  const education = eduSnap.exists ? (eduSnap.data()?.items ?? []) : [];
  const certifications = certSnap.exists ? (certSnap.data()?.items ?? []) : [];

  const labels: Record<string, Record<string, string>> = {
    ko: { skills: '기술 스택', projects: '프로젝트', timeline: '경력', education: '학력', certs: '자격증 · 수상', contact: '연락처' },
    en: { skills: 'Skills', projects: 'Projects', timeline: 'Experience', education: 'Education', certs: 'Certifications & Awards', contact: 'Contact' },
    ja: { skills: 'スキル', projects: 'プロジェクト', timeline: '経歴', education: '学歴', certs: '資格・受賞', contact: 'お問い合わせ' },
    zh: { skills: '技能', projects: '项目', timeline: '经历', education: '学历', certs: '资格���书·获奖', contact: '联系方式' },
  };
  const l = labels[lang] ?? labels.ko;

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  @page { margin: 20mm 15mm; }
  body { font-family: 'Pretendard', -apple-system, sans-serif; font-size: 11pt; color: #1a1a1a; line-height: 1.6; }
  h1 { font-size: 22pt; margin: 0 0 4px; }
  h2 { font-size: 13pt; color: #555; border-bottom: 1.5px solid #ddd; padding-bottom: 4px; margin: 18px 0 8px; }
  .sub { color: #666; font-size: 10pt; }
  .bio { margin: 8px 0 14px; color: #333; }
  .grid { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
  .tag { background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 9pt; }
  .item { margin-bottom: 10px; }
  .item-title { font-weight: 700; font-size: 10.5pt; }
  .item-sub { color: #666; font-size: 9pt; }
  .item-desc { font-size: 9.5pt; color: #444; }
</style></head><body>`;

  if (hero) {
    html += `<h1>${hero.headline}</h1>`;
    html += `<p class="sub">${hero.subline}</p>`;
  }
  html += `<p class="sub">yeojoonsoo02@gmail.com · github.com/yeojoonsoo02</p>`;

  if (summary?.bio) {
    html += `<p class="bio">${summary.bio}</p>`;
  }

  if (education.length > 0) {
    html += `<h2>${l.education}</h2>`;
    for (const e of education.sort((a: { order: number }, b: { order: number }) => a.order - b.order)) {
      html += `<div class="item"><span class="item-title">${e.school}</span> <span class="item-sub">${e.period}</span><br><span class="item-desc">${e.major}${e.gpa ? ` (GPA: ${e.gpa})` : ''}${e.description ? ` — ${e.description}` : ''}</span></div>`;
    }
  }

  if (skills.length > 0) {
    html += `<h2>${l.skills}</h2>`;
    for (const cat of skills) {
      html += `<div class="item"><span class="item-title">${cat.name}</span><div class="grid">`;
      for (const s of cat.items) {
        html += `<span class="tag">${s.name}</span>`;
      }
      html += `</div></div>`;
    }
  }

  if (projects.length > 0) {
    html += `<h2>${l.projects}</h2>`;
    const featured = projects.filter((p: { featured: boolean }) => p.featured).sort((a: { order: number }, b: { order: number }) => a.order - b.order);
    for (const p of featured) {
      html += `<div class="item"><span class="item-title">${p.title}</span>`;
      if (p.liveUrl) html += ` <span class="item-sub">${p.liveUrl}</span>`;
      html += `<br><span class="item-desc">${p.description}</span>`;
      if (p.tags?.length) {
        html += `<div class="grid">`;
        for (const t of p.tags) html += `<span class="tag">${t}</span>`;
        html += `</div>`;
      }
      html += `</div>`;
    }
  }

  if (certifications.length > 0) {
    html += `<h2>${l.certs}</h2>`;
    for (const c of certifications.sort((a: { order: number }, b: { order: number }) => a.order - b.order)) {
      html += `<div class="item"><span class="item-title">${c.name}</span> <span class="item-sub">${c.issuer} · ${c.date}</span></div>`;
    }
  }

  if (timeline.length > 0) {
    html += `<h2>${l.timeline}</h2>`;
    for (const t of timeline.sort((a: { order: number }, b: { order: number }) => a.order - b.order)) {
      html += `<div class="item"><span class="item-title">${t.title}</span> <span class="item-sub">${t.year}</span><br><span class="item-desc">${t.description}</span></div>`;
    }
  }

  html += `</body></html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="resume_${lang}.html"`,
    },
  });
}
