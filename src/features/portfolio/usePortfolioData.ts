'use client';

import { useState, useEffect } from 'react';
import type {
  PortfolioHero, Project, SkillCategory, TimelineItem,
  Education, GoalItem, ValueQuote,
} from './portfolio.model';

export interface PortfolioData {
  hero: PortfolioHero | null;
  projects: Project[];
  skills: SkillCategory[];
  timeline: TimelineItem[];
  education: Education[];
  goals: GoalItem[];
  values: ValueQuote[];
}

const EMPTY_DATA: PortfolioData = {
  hero: null, projects: [], skills: [], timeline: [],
  education: [], goals: [], values: [],
};

interface UsePortfolioDataReturn {
  data: PortfolioData;
  loaded: boolean;
  loadError: boolean;
}

// 한국어판은 서버가 첫 HTML에 실어 보낸다(initial) — 검색엔진과 링크 미리보기가 본문을 읽는다.
// 다른 언어는 서버 API를 거쳐 받는다(브라우저가 Firestore에 직접 붙지 않음 — googleapis 차단망 대응).
// 신상·취미(personalInfo·hobbies)는 API에 남아 있지만 포트폴리오 화면은 일 중심이라 쓰지 않는다.
export function usePortfolioData(lang: string, initial: PortfolioData | null): UsePortfolioDataReturn {
  // 다른 언어로 보고 있던 사람이 넘어온 경우엔 한국어판을 잠깐 보여주지 않고 그 언어판을 기다린다.
  const [data, setData] = useState<PortfolioData | null>(lang === 'ko' ? initial : null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (lang === 'ko' && initial) {
      setData(initial);
      setLoadError(false);
      return;
    }
    let cancelled = false;
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
          goals: d.goals ?? [],
          values: d.values ?? [],
        });
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [lang, initial]);

  // 언어를 바꾸는 동안에는 직전 내용을 그대로 둔다 — 로딩 화면으로 깜빡이지 않는다.
  return { data: data ?? EMPTY_DATA, loaded: data !== null || loadError, loadError };
}
