'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PortfolioHero from '@/features/portfolio/PortfolioHero';
import ProjectGallery from '@/features/portfolio/ProjectGallery';
import SkillsSection from '@/features/portfolio/SkillsSection';
import TimelineSection from '@/features/portfolio/TimelineSection';
import ContactSection from '@/features/portfolio/ContactSection';
import {
  fetchHero,
  fetchProjects,
  fetchSkills,
  fetchTimeline,
} from '@/features/portfolio/portfolio.api';
import type {
  PortfolioHero as HeroType,
  Project,
  SkillCategory,
  TimelineItem,
} from '@/features/portfolio/portfolio.model';

export default function PortfolioPage() {
  const { i18n } = useTranslation();
  const [hero, setHero] = useState<HeroType | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const lang = i18n.language || 'ko';
    Promise.all([
      fetchHero(lang),
      fetchProjects(lang),
      fetchSkills(lang),
      fetchTimeline(lang),
    ]).then(([h, p, s, tl]) => {
      setHero(h);
      setProjects(p);
      setSkills(s);
      setTimeline(tl);
      setLoaded(true);
    });
  }, [i18n.language]);

  if (!loaded) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <p style={{ color: 'var(--muted)' }}>Loading...</p>
      </main>
    );
  }

  return (
    <main
      className="max-w-2xl mx-auto px-5 sm:px-6 pt-16 sm:pt-20 pb-20"
      style={{ background: 'var(--background)' }}
    >
      <PortfolioHero data={hero} />
      <ProjectGallery items={projects} />
      <SkillsSection categories={skills} />
      <TimelineSection items={timeline} />
      <ContactSection />
    </main>
  );
}
