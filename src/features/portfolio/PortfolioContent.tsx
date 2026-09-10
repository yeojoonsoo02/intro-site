'use client';

import { useTranslation } from 'react-i18next';
import PortfolioHero from './PortfolioHero';
import FeaturedProjects from './FeaturedProjects';
import ProjectArchive from './ProjectArchive';
import TimelineSection from './TimelineSection';
import EducationSection from './EducationSection';
import SkillsSection from './SkillsSection';
import ValuesGoalsSection from './ValuesGoalsSection';
import ContactSection from './ContactSection';
import { usePortfolioData } from './usePortfolioData';
import { splitProjects } from './projectUtils';

// 순서는 리뷰어의 읽기 순서다: 무엇을 만들었나(대표 3개) → 나머지 → 어디서 일했나 → 배경 → 기술 → 사람 → 연락.
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

  const { featured, archive } = splitProjects(data.projects);

  return (
    <div className="max-w-[720px] mx-auto px-5 sm:px-6 pt-16 sm:pt-20 pb-20">
      {loadError && (
        <p
          className="mb-8 px-4 py-3 rounded-[var(--r-md)] text-[15px]"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
        >
          {t('loadError')}
        </p>
      )}
      <PortfolioHero data={data.hero} />
      <FeaturedProjects items={featured} />
      <ProjectArchive items={archive} />
      <TimelineSection items={data.timeline} />
      <EducationSection items={data.education} certifications={data.certifications} />
      <SkillsSection categories={data.skills} />
      <ValuesGoalsSection values={data.values} goals={data.goals} />
      <ContactSection />
    </div>
  );
}
