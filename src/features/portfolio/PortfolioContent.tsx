'use client';

import { useState, useEffect, useCallback } from 'react';
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
import {
  fetchHero, saveHero,
  fetchProjects, saveProjects,
  fetchSkills, saveSkills,
  fetchTimeline, saveTimeline,
  fetchSummary, saveSummary,
  fetchCertifications, saveCertifications,
  fetchTestimonials, saveTestimonials,
  fetchEducation, saveEducation,
  fetchPersonalInfo, savePersonalInfo,
  fetchGoals, saveGoals,
  fetchValues, saveValues,
  fetchRoutine, saveRoutine,
  fetchHobbies, saveHobbies,
} from './portfolio.api';
import type {
  PortfolioHero as HeroType,
  Project,
  SkillCategory,
  TimelineItem,
  PortfolioSummary,
  Certification,
  Testimonial,
  Education,
  PersonalInfoItem,
  GoalItem,
  ValueQuote,
  RoutineStep,
  HobbyCategory,
} from './portfolio.model';

const HeroEditor = dynamic(() => import('@/features/admin/HeroEditor'), { ssr: false, loading: () => null });
const ProjectEditor = dynamic(() => import('@/features/admin/ProjectEditor'), { ssr: false, loading: () => null });
const SkillsEditor = dynamic(() => import('@/features/admin/SkillsEditor'), { ssr: false, loading: () => null });
const TimelineEditor = dynamic(() => import('@/features/admin/TimelineEditor'), { ssr: false, loading: () => null });

const LANGS = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
];

export default function PortfolioContent({ isAdmin = false }: { isAdmin?: boolean }) {
  const { i18n, t } = useTranslation();
  const [hero, setHero] = useState<HeroType | null>(null);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [values, setValues] = useState<ValueQuote[]>([]);
  const [routine, setRoutine] = useState<RoutineStep[]>([]);
  const [hobbies, setHobbies] = useState<HobbyCategory[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [adminLang, setAdminLang] = useState(i18n.language || 'ko');

  const lang = isAdmin ? adminLang : (i18n.language || 'ko');

  const loadData = useCallback(async () => {
    setLoaded(false);
    setLoadError(null);
    try {
      // 공개 페이지: Admin SDK API로 읽기 (Firestore 규칙 우회)
      // 관리자: 클라이언트 SDK로 직접 읽기 (쓰기 필요)
      if (!isAdmin) {
        const res = await fetch(`/api/portfolio?lang=${lang}`);
        if (!res.ok) throw new Error('API fetch failed');
        const data = await res.json();
        setHero(data.hero ?? { headline: '', subline: '' });
        setSummary(data.summary ?? null);
        setProjects(data.projects ?? []);
        setSkills(data.skills ?? []);
        setTimeline(data.timeline ?? []);
        setCertifications(data.certifications ?? []);
        setTestimonials(data.testimonials ?? []);
        setEducation(data.education ?? []);
        setPersonalInfo(data.personalInfo ?? []);
        setGoals(data.goals ?? []);
        setValues(data.values ?? []);
        setRoutine(data.routine ?? []);
        setHobbies(data.hobbies ?? []);
      } else {
        const [h, sm, p, s, tl, cert, test, edu, pi, gl, vl, rt, hb] = await Promise.allSettled([
          fetchHero(lang), fetchSummary(lang), fetchProjects(lang), fetchSkills(lang), fetchTimeline(lang),
          fetchCertifications(lang), fetchTestimonials(lang), fetchEducation(lang),
          fetchPersonalInfo(lang), fetchGoals(lang), fetchValues(lang), fetchRoutine(lang), fetchHobbies(lang),
        ]);
        setHero(h.status === 'fulfilled' && h.value ? h.value : { headline: '', subline: '' });
        setSummary(sm.status === 'fulfilled' ? sm.value : null);
        setProjects(p.status === 'fulfilled' ? p.value : []);
        setSkills(s.status === 'fulfilled' ? s.value : []);
        setTimeline(tl.status === 'fulfilled' ? tl.value : []);
        setCertifications(cert.status === 'fulfilled' ? cert.value : []);
        setTestimonials(test.status === 'fulfilled' ? test.value : []);
        setEducation(edu.status === 'fulfilled' ? edu.value : []);
        setPersonalInfo(pi.status === 'fulfilled' ? pi.value : []);
        setGoals(gl.status === 'fulfilled' ? gl.value : []);
        setValues(vl.status === 'fulfilled' ? vl.value : []);
        setRoutine(rt.status === 'fulfilled' ? rt.value : []);
        setHobbies(hb.status === 'fulfilled' ? hb.value : []);
        const failures = [h, sm, p, s, tl, cert, test, edu, pi, gl, vl, rt, hb].filter((r) => r.status === 'rejected');
        if (failures.length > 0) {
          setLoadError(`${failures.length}개 섹션 로드 실패`);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load data';
      setLoadError(msg);
    }
    setLoaded(true);
  }, [lang, isAdmin]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    if (!hero) return;
    setSaving(true);
    setSaved(false);
    const saves: Promise<void>[] = [
      saveHero(hero, lang),
      saveProjects(projects, lang),
      saveSkills(skills, lang),
      saveTimeline(timeline, lang),
      saveCertifications(certifications, lang),
      saveTestimonials(testimonials, lang),
      saveEducation(education, lang),
      savePersonalInfo(personalInfo, lang),
      saveGoals(goals, lang),
      saveValues(values, lang),
      saveRoutine(routine, lang),
      saveHobbies(hobbies, lang),
    ];
    if (summary) saves.push(saveSummary(summary, lang));
    await Promise.all(saves);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--muted)' }}>{t('loading')}</p>
      </div>
    );
  }

  const editorBox = (label: string, children: React.ReactNode): React.ReactNode => (
    <div
      className="mb-14 -mt-6 rounded-xl p-5"
      style={{
        background: 'color-mix(in srgb, var(--primary) 4%, transparent)',
        border: '1px dashed color-mix(in srgb, var(--primary) 25%, transparent)',
      }}
    >
      <p className="text-xs font-bold mb-3" style={{ color: 'var(--primary)' }}>
        {label}
      </p>
      {children}
    </div>
  );

  return (
    <>
      <div className="max-w-2xl mx-auto px-5 sm:px-6 pt-16 sm:pt-20 pb-20">
        {/* 에러 메시지 */}
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

        {/* 관리자 상단 고정바 */}
        {isAdmin && (
          <div
            className="sticky top-0 z-30 -mx-5 sm:-mx-6 px-5 sm:px-6 pr-14 sm:pr-16 py-3 mb-8 flex items-center justify-between backdrop-blur-md"
            style={{
              background: 'color-mix(in srgb, var(--background) 85%, transparent)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div className="flex gap-1.5">
              {LANGS.map((l) => (
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
              onClick={handleSave}
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

        {/* 관리자: 모든 섹션 + 에디터 표시 */}
        {isAdmin ? (
          <>
            <PortfolioHero data={hero} />
            {hero && editorBox(
              `✏️ ${t('hero')}`,
              <HeroEditor data={hero} onChange={setHero} />,
            )}
            <PersonalInfoCard items={personalInfo} />
            <SummarySection data={summary} />
            <ValuesSection items={values} />
            <GoalsSection items={goals} />
            <EducationSection items={education} />
            <SkillsSection categories={skills} />
            {editorBox(`✏️ ${t('skills')}`, <SkillsEditor categories={skills} onChange={setSkills} />)}
            <CertificationsSection items={certifications} />
            <ProjectGallery items={projects} />
            {editorBox(`✏️ ${t('projects')}`, <ProjectEditor items={projects} onChange={setProjects} />)}
            <TestimonialsSection items={testimonials} />
            <HobbiesSection categories={hobbies} />
            <RoutineSection items={routine} />
            <GithubActivity />
            <BlogPosts />
            <TimelineSection items={timeline} />
            {editorBox(`✏️ ${t('timeline')}`, <TimelineEditor items={timeline} onChange={setTimeline} />)}
            <ContactSection />
          </>
        ) : (
          <LoginBlur>
            <PortfolioHero data={hero} />
            <div className="flex justify-end mb-6">
              <ResumeDownload />
            </div>
            <PersonalInfoCard items={personalInfo} />
            <SummarySection data={summary} />
            <ValuesSection items={values} />
            <GoalsSection items={goals} />
            <EducationSection items={education} />
            <SkillsSection categories={skills} />
            <CertificationsSection items={certifications} />
            <ProjectGallery items={projects} />
            <TestimonialsSection items={testimonials} />
            <HobbiesSection categories={hobbies} />
            <RoutineSection items={routine} />
            <GithubActivity />
            <BlogPosts />
            <TimelineSection items={timeline} />
            <ContactSection />
          </LoginBlur>
        )}

        {/* 하단 저장 버튼 */}
        {isAdmin && (
          <button
            onClick={handleSave}
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
    </>
  );
}
