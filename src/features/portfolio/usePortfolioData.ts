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
  const fromServer = lang === 'ko' && initial !== null;
  // API로 받은 다른 언어판과, 받다가 실패한 언어. 어느 언어 것인지 함께 들고 있어야
  // 언어를 바꿨을 때 지난 요청의 결과·오류가 지금 화면에 섞이지 않는다.
  const [fetched, setFetched] = useState<{ lang: string; data: PortfolioData } | null>(null);
  const [failedLang, setFailedLang] = useState<string | null>(null);
  // 한국어로 열었다가 언어를 바꾼 경우에만, 새 언어판이 올 때까지 한국어판을 그대로 둔다.
  // 처음부터 다른 언어였다면(다른 언어로 보던 사람이 넘어온 경우) 한국어판을 잠깐 보여주지 않는다.
  const [startedInKorean] = useState(lang === 'ko');

  useEffect(() => {
    if (fromServer) return;
    let cancelled = false;
    fetch(`/api/portfolio?lang=${encodeURIComponent(lang)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`portfolio fetch failed: ${res.status}`);
        return res.json();
      })
      .then((d) => {
        if (cancelled) return;
        setFetched({
          lang,
          data: {
            hero: d.hero ?? null,
            projects: d.projects ?? [],
            skills: d.skills ?? [],
            timeline: d.timeline ?? [],
            education: d.education ?? [],
            goals: d.goals ?? [],
            values: d.values ?? [],
          },
        });
        setFailedLang(null);
      })
      .catch(() => {
        if (!cancelled) setFailedLang(lang);
      });
    return () => {
      cancelled = true;
    };
  }, [lang, fromServer]);

  const data = fromServer ? initial : (fetched?.data ?? (startedInKorean ? initial : null));
  const loadError = !fromServer && failedLang === lang;

  return { data: data ?? EMPTY_DATA, loaded: data !== null || loadError, loadError };
}
