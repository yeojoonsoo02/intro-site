'use client';

import { useState, useEffect } from 'react';
import type {
  PortfolioHero, Project, SkillCategory, TimelineItem,
  Education, Certification, GoalItem, ValueQuote,
} from './portfolio.model';

export interface PortfolioData {
  hero: PortfolioHero | null;
  projects: Project[];
  skills: SkillCategory[];
  timeline: TimelineItem[];
  education: Education[];
  certifications: Certification[];
  goals: GoalItem[];
  values: ValueQuote[];
}

const EMPTY_DATA: PortfolioData = {
  hero: null, projects: [], skills: [], timeline: [],
  education: [], certifications: [], goals: [], values: [],
};

interface UsePortfolioDataReturn {
  data: PortfolioData;
  loaded: boolean;
  loadError: boolean;
}

// 브라우저가 Firestore에 직접 붙지 않고 서버 API를 거친다 — googleapis가 차단된 망 대응.
// 신상·취미(personalInfo·hobbies)는 API에 남아 있지만 포트폴리오 화면은 일 중심이라 쓰지 않는다.
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
          hero: d.hero ?? null,
          projects: d.projects ?? [],
          skills: d.skills ?? [],
          timeline: d.timeline ?? [],
          education: d.education ?? [],
          certifications: d.certifications ?? [],
          goals: d.goals ?? [],
          values: d.values ?? [],
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
