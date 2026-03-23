'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import PortfolioHero from './PortfolioHero';
import ProjectGallery from './ProjectGallery';
import SkillsSection from './SkillsSection';
import TimelineSection from './TimelineSection';
import ContactSection from './ContactSection';
import {
  fetchHero, saveHero,
  fetchProjects, saveProjects,
  fetchSkills, saveSkills,
  fetchTimeline, saveTimeline,
} from './portfolio.api';
import type {
  PortfolioHero as HeroType,
  Project,
  SkillCategory,
  TimelineItem,
} from './portfolio.model';

const HeroEditor = dynamic(() => import('@/features/admin/HeroEditor'), { ssr: false });
const ProjectEditor = dynamic(() => import('@/features/admin/ProjectEditor'), { ssr: false });
const SkillsEditor = dynamic(() => import('@/features/admin/SkillsEditor'), { ssr: false });
const TimelineEditor = dynamic(() => import('@/features/admin/TimelineEditor'), { ssr: false });

const LANGS = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
];

export default function PortfolioContent({ isAdmin = false }: { isAdmin?: boolean }) {
  const { i18n, t } = useTranslation();
  const [hero, setHero] = useState<HeroType | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [adminLang, setAdminLang] = useState(i18n.language || 'ko');

  const lang = isAdmin ? adminLang : (i18n.language || 'ko');

  const loadData = useCallback(async () => {
    setLoaded(false);
    try {
      const [h, p, s, tl] = await Promise.all([
        fetchHero(lang), fetchProjects(lang), fetchSkills(lang), fetchTimeline(lang),
      ]);
      setHero(h ?? { headline: '', subline: '' });
      setProjects(p);
      setSkills(s);
      setTimeline(tl);
    } catch {
      setHero({ headline: '', subline: '' });
      setProjects([]);
      setSkills([]);
      setTimeline([]);
    }
    setLoaded(true);
  }, [lang]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    if (!hero) return;
    setSaving(true);
    setSaved(false);
    await Promise.all([
      saveHero(hero, lang),
      saveProjects(projects, lang),
      saveSkills(skills, lang),
      saveTimeline(timeline, lang),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--muted)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 pt-16 sm:pt-20 pb-20">
      {/* 관리자 상단바 */}
      {isAdmin && (
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-1.5">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setAdminLang(l.code)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-opacity"
                style={
                  adminLang === l.code
                    ? { background: 'var(--primary)', color: 'var(--primary-contrast)' }
                    : { background: 'color-mix(in srgb, var(--foreground) 8%, transparent)', color: 'var(--muted)' }
                }
              >
                {l.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              background: saved ? '#22c55e' : 'var(--primary)',
              color: saved ? '#fff' : 'var(--primary-contrast)',
            }}
          >
            {saving ? '...' : saved ? `✓ ${t('saved')}` : t('save')}
          </button>
        </div>
      )}

      {/* 히어로 */}
      <PortfolioHero data={hero} />
      {isAdmin && hero && (
        <div className="mb-12 -mt-10 rounded-xl p-4" style={{ border: '1px dashed var(--border)' }}>
          <HeroEditor data={hero} onChange={setHero} />
        </div>
      )}

      {/* 프로젝트 */}
      <ProjectGallery items={projects} />
      {isAdmin && (
        <div className="mb-12 -mt-10 rounded-xl p-4" style={{ border: '1px dashed var(--border)' }}>
          <ProjectEditor items={projects} onChange={setProjects} />
        </div>
      )}

      {/* 기술 스택 */}
      <SkillsSection categories={skills} />
      {isAdmin && (
        <div className="mb-12 -mt-10 rounded-xl p-4" style={{ border: '1px dashed var(--border)' }}>
          <SkillsEditor categories={skills} onChange={setSkills} />
        </div>
      )}

      {/* 타임라인 */}
      <TimelineSection items={timeline} />
      {isAdmin && (
        <div className="mb-12 -mt-10 rounded-xl p-4" style={{ border: '1px dashed var(--border)' }}>
          <TimelineEditor items={timeline} onChange={setTimeline} />
        </div>
      )}

      {/* 연락처 */}
      <ContactSection />

      {/* 하단 저장 버튼 */}
      {isAdmin && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-50 mt-8"
          style={{
            background: saved ? '#22c55e' : 'var(--primary)',
            color: saved ? '#fff' : 'var(--primary-contrast)',
          }}
        >
          {saving ? t('loading') : saved ? `✓ ${t('saved')}` : t('save')}
        </button>
      )}
    </div>
  );
}
