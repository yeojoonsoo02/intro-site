import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  Project,
  SkillCategory,
  TimelineItem,
  PortfolioHero,
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

type ListKey = 'items' | 'categories';

function portfolioDoc(type: string, lang: string): ReturnType<typeof doc> {
  return doc(db, 'portfolio', `${type}_${lang}`);
}

interface SingletonStoreOptions {
  swallowErrors?: boolean;
}

interface SingletonStore<T> {
  fetch: (lang?: string) => Promise<T | null>;
  save: (data: T, lang?: string) => Promise<void>;
}

function singletonStore<T>(
  type: string,
  opts: SingletonStoreOptions = {},
): SingletonStore<T> {
  return {
    async fetch(lang = 'ko') {
      try {
        const snap = await getDoc(portfolioDoc(type, lang));
        return snap.exists() ? (snap.data() as T) : null;
      } catch (err) {
        if (opts.swallowErrors) return null;
        throw err;
      }
    },
    async save(data, lang = 'ko') {
      await setDoc(portfolioDoc(type, lang), data as object, { merge: true });
    },
  };
}

interface ListStore<T> {
  fetch: (lang?: string) => Promise<T[]>;
  save: (items: T[], lang?: string) => Promise<void>;
}

function listStore<T>(type: string, key: ListKey = 'items'): ListStore<T> {
  return {
    async fetch(lang = 'ko') {
      const snap = await getDoc(portfolioDoc(type, lang));
      if (!snap.exists()) return [];
      const data = snap.data() as Record<string, T[] | undefined>;
      return data[key] ?? [];
    },
    async save(items, lang = 'ko') {
      await setDoc(portfolioDoc(type, lang), { [key]: items }, { merge: true });
    },
  };
}

const heroStore = singletonStore<PortfolioHero>('hero');
const summaryStore = singletonStore<PortfolioSummary>('summary', { swallowErrors: true });

const projectsStore = listStore<Project>('projects');
const skillsStore = listStore<SkillCategory>('skills', 'categories');
const timelineStore = listStore<TimelineItem>('timeline');
const certificationsStore = listStore<Certification>('certifications');
const testimonialsStore = listStore<Testimonial>('testimonials');
const educationStore = listStore<Education>('education');
const personalInfoStore = listStore<PersonalInfoItem>('personalInfo');
const goalsStore = listStore<GoalItem>('goals');
const valuesStore = listStore<ValueQuote>('values');
const routineStore = listStore<RoutineStep>('routine');
const hobbiesStore = listStore<HobbyCategory>('hobbies', 'categories');

export const fetchHero = heroStore.fetch;
export const saveHero = heroStore.save;

export const fetchSummary = summaryStore.fetch;
export const saveSummary = summaryStore.save;

export const fetchProjects = projectsStore.fetch;
export const saveProjects = projectsStore.save;

export const fetchSkills = skillsStore.fetch;
export const saveSkills = skillsStore.save;

export const fetchTimeline = timelineStore.fetch;
export const saveTimeline = timelineStore.save;

export const fetchCertifications = certificationsStore.fetch;
export const saveCertifications = certificationsStore.save;

export const fetchTestimonials = testimonialsStore.fetch;
export const saveTestimonials = testimonialsStore.save;

export const fetchEducation = educationStore.fetch;
export const saveEducation = educationStore.save;

export const fetchPersonalInfo = personalInfoStore.fetch;
export const savePersonalInfo = personalInfoStore.save;

export const fetchGoals = goalsStore.fetch;
export const saveGoals = goalsStore.save;

export const fetchValues = valuesStore.fetch;
export const saveValues = valuesStore.save;

export const fetchRoutine = routineStore.fetch;
export const saveRoutine = routineStore.save;

export const fetchHobbies = hobbiesStore.fetch;
export const saveHobbies = hobbiesStore.save;
