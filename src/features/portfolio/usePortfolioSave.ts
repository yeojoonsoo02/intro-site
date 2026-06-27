'use client';

import { useState, useCallback } from 'react';
import {
  saveHero, saveProjects, saveSkills, saveTimeline,
  saveSummary, saveCertifications, saveTestimonials,
  saveEducation, savePersonalInfo, saveGoals,
  saveValues, saveRoutine, saveHobbies,
} from './portfolio.api';
import type { PortfolioData } from './usePortfolioData';

export interface UsePortfolioSaveReturn {
  saving: boolean;
  saved: boolean;
  saveError: boolean;
  handleSave: (data: PortfolioData, lang: string) => Promise<void>;
}

export function usePortfolioSave(): UsePortfolioSaveReturn {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const handleSave = useCallback(async (data: PortfolioData, lang: string) => {
    if (!data.hero) return;
    setSaving(true);
    setSaved(false);
    setSaveError(false);

    const saves: Promise<void>[] = [
      saveHero(data.hero, lang),
      saveProjects(data.projects, lang),
      saveSkills(data.skills, lang),
      saveTimeline(data.timeline, lang),
      saveCertifications(data.certifications, lang),
      saveTestimonials(data.testimonials, lang),
      saveEducation(data.education, lang),
      savePersonalInfo(data.personalInfo, lang),
      saveGoals(data.goals, lang),
      saveValues(data.values, lang),
      saveRoutine(data.routine, lang),
      saveHobbies(data.hobbies, lang),
    ];
    if (data.summary) saves.push(saveSummary(data.summary, lang));

    try {
      // allSettled로 일부 실패해도 나머지 저장을 보장하고, 실패 시 사용자에게 알린다.
      const results = await Promise.allSettled(saves);
      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        console.error(`포트폴리오 저장 ${failed.length}건 실패:`, failed);
        setSaveError(true);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      // 성공·실패와 무관하게 항상 해제 → 'saving' 영구 고착 방지
      setSaving(false);
    }
  }, []);

  return { saving, saved, saveError, handleSave };
}
