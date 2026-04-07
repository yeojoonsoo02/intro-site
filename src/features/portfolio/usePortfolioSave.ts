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
  handleSave: (data: PortfolioData, lang: string) => Promise<void>;
}

export function usePortfolioSave(): UsePortfolioSaveReturn {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async (data: PortfolioData, lang: string) => {
    if (!data.hero) return;
    setSaving(true);
    setSaved(false);

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

    await Promise.all(saves);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  return { saving, saved, handleSave };
}
