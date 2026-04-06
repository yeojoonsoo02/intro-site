export interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  tags: string[];
  liveUrl?: string;
  repoUrl?: string;
  featured: boolean;
  order: number;
  category?: 'web' | 'mobile' | 'ai' | 'other';
}

export interface SkillItem {
  name: string;
  level: number;
}

export interface SkillCategory {
  id: string;
  name: string;
  items: SkillItem[];
}

export interface TimelineItem {
  id: string;
  year: string;
  title: string;
  description: string;
  type: 'work' | 'education' | 'project' | 'etc';
  order: number;
}

export interface PortfolioHero {
  headline: string;
  subline: string;
}

export interface PortfolioSummary {
  bio: string;
  highlights: { label: string; value: string }[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  order: number;
}

export interface Education {
  id: string;
  school: string;
  major: string;
  period: string;
  gpa?: string;
  description?: string;
  order: number;
}

export interface PersonalInfoItem {
  label: string;
  value: string;
}

export interface GoalItem {
  id: string;
  content: string;
  order: number;
}

export interface ValueQuote {
  id: string;
  content: string;
  order: number;
}

export interface RoutineStep {
  id: string;
  time: string;
  content: string;
  order: number;
}

export interface HobbyCategory {
  id: string;
  name: string;
  items: string[];
}
