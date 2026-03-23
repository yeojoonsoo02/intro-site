'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import HeroEditor from './HeroEditor';
import ProjectEditor from './ProjectEditor';
import SkillsEditor from './SkillsEditor';
import TimelineEditor from './TimelineEditor';
import {
  fetchHero, saveHero,
  fetchProjects, saveProjects,
  fetchSkills, saveSkills,
  fetchTimeline, saveTimeline,
} from '@/features/portfolio/portfolio.api';
import type { PortfolioHero, Project, SkillCategory, TimelineItem } from '@/features/portfolio/portfolio.model';

const TABS = ['hero', 'projects', 'skills', 'timeline'] as const;
type Tab = (typeof TABS)[number];

const LANGS = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('hero');
  const [lang, setLang] = useState('ko');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [hero, setHero] = useState<PortfolioHero>({ headline: '', subline: '' });
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);

  const loadData = useCallback(async () => {
    const [h, p, s, tl] = await Promise.all([
      fetchHero(lang),
      fetchProjects(lang),
      fetchSkills(lang),
      fetchTimeline(lang),
    ]);
    setHero(h ?? { headline: '', subline: '' });
    setProjects(p);
    setSkills(s);
    setTimeline(tl);
  }, [lang]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await Promise.all([
        saveHero(hero, lang),
        saveProjects(projects, lang),
        saveSkills(skills, lang),
        saveTimeline(timeline, lang),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main
      className="min-h-screen px-4 py-8"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
            {t('adminDashboard')}
          </h1>
          <a
            href="/portfolio"
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--primary)' }}
          >
            {t('portfolio')} →
          </a>
        </div>

        {/* 언어 선택 */}
        <div className="flex gap-2 mb-4">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity"
              style={
                lang === l.code
                  ? { background: 'var(--primary)', color: 'var(--primary-contrast)' }
                  : { background: 'color-mix(in srgb, var(--foreground) 6%, transparent)', color: 'var(--muted)' }
              }
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* 탭 */}
        <div
          className="flex gap-1 mb-6 p-1 rounded-xl"
          style={{ background: 'color-mix(in srgb, var(--foreground) 5%, transparent)' }}
        >
          {TABS.map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                tab === key
                  ? { background: 'var(--card-bg)', color: 'var(--foreground)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                  : { color: 'var(--muted)' }
              }
            >
              {t(key)}
            </button>
          ))}
        </div>

        {/* 에디터 */}
        <div
          className="rounded-2xl p-5 sm:p-6 mb-6"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          {tab === 'hero' && <HeroEditor data={hero} onChange={setHero} />}
          {tab === 'projects' && <ProjectEditor items={projects} onChange={setProjects} />}
          {tab === 'skills' && <SkillsEditor categories={skills} onChange={setSkills} />}
          {tab === 'timeline' && <TimelineEditor items={timeline} onChange={setTimeline} />}
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{
            background: saved ? '#22c55e' : 'var(--primary)',
            color: saved ? '#fff' : 'var(--primary-contrast)',
          }}
        >
          {saving ? t('loading') : saved ? `✓ ${t('saved')}` : t('save')}
        </button>
      </div>
    </main>
  );
}
