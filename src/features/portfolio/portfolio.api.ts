import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Project, SkillCategory, TimelineItem, PortfolioHero, PortfolioSummary } from './portfolio.model';

function portfolioDoc(type: string, lang: string = 'ko') {
  return doc(db, 'portfolio', `${type}_${lang}`);
}

// Hero
export async function fetchHero(lang: string = 'ko'): Promise<PortfolioHero | null> {
  const snap = await getDoc(portfolioDoc('hero', lang));
  return snap.exists() ? (snap.data() as PortfolioHero) : null;
}
export async function saveHero(data: PortfolioHero, lang: string = 'ko') {
  await setDoc(portfolioDoc('hero', lang), data, { merge: true });
}

// Projects
export async function fetchProjects(lang: string = 'ko'): Promise<Project[]> {
  const snap = await getDoc(portfolioDoc('projects', lang));
  if (!snap.exists()) return [];
  const data = snap.data() as { items?: Project[] };
  return data.items ?? [];
}
export async function saveProjects(items: Project[], lang: string = 'ko') {
  await setDoc(portfolioDoc('projects', lang), { items }, { merge: true });
}

// Skills
export async function fetchSkills(lang: string = 'ko'): Promise<SkillCategory[]> {
  const snap = await getDoc(portfolioDoc('skills', lang));
  if (!snap.exists()) return [];
  const data = snap.data() as { categories?: SkillCategory[] };
  return data.categories ?? [];
}
export async function saveSkills(categories: SkillCategory[], lang: string = 'ko') {
  await setDoc(portfolioDoc('skills', lang), { categories }, { merge: true });
}

// Timeline
export async function fetchTimeline(lang: string = 'ko'): Promise<TimelineItem[]> {
  const snap = await getDoc(portfolioDoc('timeline', lang));
  if (!snap.exists()) return [];
  const data = snap.data() as { items?: TimelineItem[] };
  return data.items ?? [];
}
export async function saveTimeline(items: TimelineItem[], lang: string = 'ko') {
  await setDoc(portfolioDoc('timeline', lang), { items }, { merge: true });
}

// Summary
export async function fetchSummary(lang: string = 'ko'): Promise<PortfolioSummary | null> {
  const snap = await getDoc(portfolioDoc('summary', lang));
  return snap.exists() ? (snap.data() as PortfolioSummary) : null;
}
export async function saveSummary(data: PortfolioSummary, lang: string = 'ko') {
  await setDoc(portfolioDoc('summary', lang), data, { merge: true });
}
