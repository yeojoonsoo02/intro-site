'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import PortfolioHero from './PortfolioHero';
import SummarySection from './SummarySection';
import ProjectGallery from './ProjectGallery';
import SkillsSection from './SkillsSection';
import TimelineSection from './TimelineSection';
import ContactSection from './ContactSection';
import CertificationsSection from './CertificationsSection';
import TestimonialsSection from './TestimonialsSection';
import EducationSection from './EducationSection';
import GithubActivity from './GithubActivity';
import BlogPosts from './BlogPosts';
import ResumeDownload from './ResumeDownload';
import PersonalInfoCard from './PersonalInfoCard';
import GoalsSection from './GoalsSection';
import ValuesSection from './ValuesSection';
import RoutineSection from './RoutineSection';
import HobbiesSection from './HobbiesSection';
import LoginBlur from './LoginBlur';
import { usePortfolioData } from './usePortfolioData';
import { usePortfolioSave } from './usePortfolioSave';
import { SUPPORTED_LANGS } from '@/lib/i18n-config';

const HeroEditor = dynamic(() => import('@/features/admin/HeroEditor'), { ssr: false, loading: () => null });
const ProjectEditor = dynamic(() => import('@/features/admin/ProjectEditor'), { ssr: false, loading: () => null });
const SkillsEditor = dynamic(() => import('@/features/admin/SkillsEditor'), { ssr: false, loading: () => null });
const TimelineEditor = dynamic(() => import('@/features/admin/TimelineEditor'), { ssr: false, loading: () => null });

function EditorBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="mb-14 -mt-6 rounded-xl p-5"
      style={{
        background: 'color-mix(in srgb, var(--primary) 4%, transparent)',
        border: '1px dashed color-mix(in srgb, var(--primary) 25%, transparent)',
      }}
    >
      <p className="text-xs font-bold mb-3" style={{ color: 'var(--primary)' }}>{label}</p>
      {children}
    </div>
  );
}

function PortfolioSections({ data, isAdmin, setData, t }: {
  data: ReturnType<typeof usePortfolioData>['data'];
  isAdmin: boolean;
  setData: ReturnType<typeof usePortfolioData>['setData'];
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const sections = (
    <>
      <PortfolioHero data={data.hero} />
      {!isAdmin && (
        <div className="flex justify-end mb-6">
          <ResumeDownload />
        </div>
      )}
      {isAdmin && data.hero && (
        <EditorBox label={`✏️ ${t('hero')}`}>
          <HeroEditor data={data.hero} onChange={(hero) => setData((d) => ({ ...d, hero }))} />
        </EditorBox>
      )}
      <PersonalInfoCard items={data.personalInfo} />
      <SummarySection data={data.summary} />
      <ValuesSection items={data.values} />
      <GoalsSection items={data.goals} />
      <EducationSection items={data.education} />
      <SkillsSection categories={data.skills} />
      {isAdmin && (
        <EditorBox label={`✏️ ${t('skills')}`}>
          <SkillsEditor categories={data.skills} onChange={(skills) => setData((d) => ({ ...d, skills }))} />
        </EditorBox>
      )}
      <CertificationsSection items={data.certifications} />
      <ProjectGallery items={data.projects} />
      {isAdmin && (
        <EditorBox label={`✏️ ${t('projects')}`}>
          <ProjectEditor items={data.projects} onChange={(projects) => setData((d) => ({ ...d, projects }))} />
        </EditorBox>
      )}
      <TestimonialsSection items={data.testimonials} />
      <HobbiesSection categories={data.hobbies} />
      <RoutineSection items={data.routine} />
      <GithubActivity />
      <BlogPosts />
      <TimelineSection items={data.timeline} />
      {isAdmin && (
        <EditorBox label={`✏️ ${t('timeline')}`}>
          <TimelineEditor items={data.timeline} onChange={(timeline) => setData((d) => ({ ...d, timeline }))} />
        </EditorBox>
      )}
      <ContactSection />
    </>
  );

  if (isAdmin) return sections;
  return <LoginBlur>{sections}</LoginBlur>;
}

export default function PortfolioContent({ isAdmin = false }: { isAdmin?: boolean }) {
  const { i18n, t } = useTranslation();
  const [adminLang, setAdminLang] = useState(i18n.language || 'ko');
  const lang = isAdmin ? adminLang : (i18n.language || 'ko');

  const { data, setData, loaded, loadError } = usePortfolioData(lang, isAdmin);
  const { saving, saved, handleSave } = usePortfolioSave();

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--muted)' }}>{t('loading')}</p>
      </div>
    );
  }

  const onSave = () => handleSave(data, lang);

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 pt-16 sm:pt-20 pb-20">
      {loadError && (
        <div
          className="mb-6 p-4 rounded-xl text-sm"
          style={{
            background: 'color-mix(in srgb, #ef4444 10%, transparent)',
            color: '#ef4444',
            border: '1px solid color-mix(in srgb, #ef4444 25%, transparent)',
          }}
        >
          {loadError}
        </div>
      )}

      {isAdmin && (
        <div
          className="sticky top-0 z-30 -mx-5 sm:-mx-6 px-5 sm:px-6 pr-14 sm:pr-16 py-3 mb-8 flex items-center justify-between backdrop-blur-md"
          style={{
            background: 'color-mix(in srgb, var(--background) 85%, transparent)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="flex gap-1.5">
            {SUPPORTED_LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setAdminLang(l.code)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
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
            onClick={onSave}
            disabled={saving}
            className="px-5 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
            style={{
              background: saved ? '#22c55e' : 'var(--primary)',
              color: saved ? '#fff' : 'var(--primary-contrast)',
            }}
          >
            {saving ? '...' : saved ? `✓ ${t('saved')}` : t('save')}
          </button>
        </div>
      )}

      <PortfolioSections data={data} isAdmin={isAdmin} setData={setData} t={t} />

      {isAdmin && (
        <button
          onClick={onSave}
          disabled={saving}
          className="w-full py-3.5 rounded-xl font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50 mt-8"
          style={{
            background: saved ? '#22c55e' : 'var(--primary)',
            color: saved ? '#fff' : 'var(--primary-contrast)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {saving ? t('loading') : saved ? `✓ ${t('saved')}` : t('save')}
        </button>
      )}
    </div>
  );
}
