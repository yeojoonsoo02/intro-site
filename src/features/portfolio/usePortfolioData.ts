'use client';

import { useState, useEffect } from 'react';
import type {
  PortfolioHero, Project, SkillCategory, TimelineItem,
  PortfolioSummary, Education, PersonalInfoItem, GoalItem, ValueQuote, HobbyCategory,
} from './portfolio.model';

export interface PortfolioData {
  hero: PortfolioHero | null;
  summary: PortfolioSummary | null;
  projects: Project[];
  skills: SkillCategory[];
  timeline: TimelineItem[];
  education: Education[];
  personalInfo: PersonalInfoItem[];
  goals: GoalItem[];
  values: ValueQuote[];
  hobbies: HobbyCategory[];
}

const EMPTY_DATA: PortfolioData = {
  hero: null, summary: null, projects: [], skills: [], timeline: [],
  education: [], personalInfo: [], goals: [], values: [], hobbies: [],
};

interface UsePortfolioDataReturn {
  data: PortfolioData;
  loaded: boolean;
  loadError: boolean;
}

// 브라우저가 Firestore에 직접 붙지 않고 서버 API를 거친다 — googleapis가 차단된 망 대응.
export function usePortfolioData(lang: string): UsePortfolioDataReturn {
  const [data, setData] = useState<PortfolioData>(EMPTY_DATA);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setLoadError(false);
    fetch(`/api/portfolio?lang=${encodeURIComponent(lang)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`portfolio fetch failed: ${res.status}`);
        return res.json();
      })
      .then((d) => {
        if (cancelled) return;
        setData({
          hero: d.hero ?? { headline: '', subline: '' },
          summary: d.summary ?? null,
          projects: d.projects ?? [],
          skills: d.skills ?? [],
          timeline: d.timeline ?? [],
          education: d.education ?? [],
          personalInfo: d.personalInfo ?? [],
          goals: d.goals ?? [],
          values: d.values ?? [],
          hobbies: d.hobbies ?? [],
        });
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  return { data, loaded, loadError };
}
