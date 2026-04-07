'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchHero, fetchProjects, fetchSkills, fetchTimeline,
  fetchSummary, fetchCertifications, fetchTestimonials,
  fetchEducation, fetchPersonalInfo, fetchGoals,
  fetchValues, fetchRoutine, fetchHobbies,
} from './portfolio.api';
import type {
  PortfolioHero, Project, SkillCategory, TimelineItem,
  PortfolioSummary, Certification, Testimonial, Education,
  PersonalInfoItem, GoalItem, ValueQuote, RoutineStep, HobbyCategory,
} from './portfolio.model';

export interface PortfolioData {
  hero: PortfolioHero | null;
  summary: PortfolioSummary | null;
  projects: Project[];
  skills: SkillCategory[];
  timeline: TimelineItem[];
  certifications: Certification[];
  testimonials: Testimonial[];
  education: Education[];
  personalInfo: PersonalInfoItem[];
  goals: GoalItem[];
  values: ValueQuote[];
  routine: RoutineStep[];
  hobbies: HobbyCategory[];
}

const EMPTY_DATA: PortfolioData = {
  hero: null, summary: null, projects: [], skills: [], timeline: [],
  certifications: [], testimonials: [], education: [],
  personalInfo: [], goals: [], values: [], routine: [], hobbies: [],
};

export interface UsePortfolioDataReturn {
  data: PortfolioData;
  setData: React.Dispatch<React.SetStateAction<PortfolioData>>;
  loaded: boolean;
  loadError: string | null;
}

export function usePortfolioData(lang: string, isAdmin: boolean): UsePortfolioDataReturn {
  const [data, setData] = useState<PortfolioData>(EMPTY_DATA);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoaded(false);
    setLoadError(null);
    try {
      if (!isAdmin) {
        const res = await fetch(`/api/portfolio?lang=${lang}`);
        if (!res.ok) throw new Error('API fetch failed');
        const d = await res.json();
        setData({
          hero: d.hero ?? { headline: '', subline: '' },
          summary: d.summary ?? null,
          projects: d.projects ?? [],
          skills: d.skills ?? [],
          timeline: d.timeline ?? [],
          certifications: d.certifications ?? [],
          testimonials: d.testimonials ?? [],
          education: d.education ?? [],
          personalInfo: d.personalInfo ?? [],
          goals: d.goals ?? [],
          values: d.values ?? [],
          routine: d.routine ?? [],
          hobbies: d.hobbies ?? [],
        });
      } else {
        const fetchers = [
          fetchHero(lang), fetchSummary(lang), fetchProjects(lang),
          fetchSkills(lang), fetchTimeline(lang), fetchCertifications(lang),
          fetchTestimonials(lang), fetchEducation(lang), fetchPersonalInfo(lang),
          fetchGoals(lang), fetchValues(lang), fetchRoutine(lang), fetchHobbies(lang),
        ];
        const results = await Promise.allSettled(fetchers);
        const get = <T,>(idx: number, fallback: T): T =>
          results[idx].status === 'fulfilled' ? (results[idx].value as T) : fallback;

        setData({
          hero: get(0, null) ?? { headline: '', subline: '' },
          summary: get(1, null),
          projects: get(2, []),
          skills: get(3, []),
          timeline: get(4, []),
          certifications: get(5, []),
          testimonials: get(6, []),
          education: get(7, []),
          personalInfo: get(8, []),
          goals: get(9, []),
          values: get(10, []),
          routine: get(11, []),
          hobbies: get(12, []),
        });

        const failures = results.filter((r) => r.status === 'rejected').length;
        if (failures > 0) setLoadError(`${failures}개 섹션 로드 실패`);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load data');
    }
    setLoaded(true);
  }, [lang, isAdmin]);

  useEffect(() => { loadData(); }, [loadData]);

  return { data, setData, loaded, loadError };
}
