'use client';

import { useTranslation } from 'react-i18next';
import PortfolioHero from './PortfolioHero';
import SummarySection from './SummarySection';
import ProjectGallery from './ProjectGallery';
import SkillsSection from './SkillsSection';
import TimelineSection from './TimelineSection';
import ContactSection from './ContactSection';
import EducationSection from './EducationSection';
import PersonalInfoCard from './PersonalInfoCard';
import GoalsSection from './GoalsSection';
import ValuesSection from './ValuesSection';
import HobbiesSection from './HobbiesSection';
import { usePortfolioData } from './usePortfolioData';

export default function PortfolioContent() {
  const { i18n, t } = useTranslation();
  const { data, loaded, loadError } = usePortfolioData(i18n.language || 'ko');

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--muted)' }}>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 pt-16 sm:pt-20 pb-20">
      {loadError && (
        <div
          className="mb-6 p-4 rounded-xl text-sm"
          style={{
            background: 'color-mix(in srgb, var(--danger) 10%, transparent)',
            color: 'var(--danger)',
            border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)',
          }}
        >
          {t('loadError')}
        </div>
      )}
      <PortfolioHero data={data.hero} />
      <PersonalInfoCard items={data.personalInfo} />
      <SummarySection data={data.summary} />
      <ValuesSection items={data.values} />
      <GoalsSection items={data.goals} />
      <EducationSection items={data.education} />
      <SkillsSection categories={data.skills} />
      <ProjectGallery items={data.projects} />
      <HobbiesSection categories={data.hobbies} />
      <TimelineSection items={data.timeline} />
      {/* 목록·요약·태그까지는 공개 — 프로젝트 회고 상세(/portfolio/[id])에서만 로그인 게이트. */}
      <ContactSection />
    </div>
  );
}
