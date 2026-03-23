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
