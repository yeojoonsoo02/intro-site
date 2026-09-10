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
  // 렌더 key용 고유 id (레거시 데이터엔 없을 수 있어 optional)
  id?: string;
  name: string;
  // 숙련도 점수는 근거 없는 자기 평가라 2026-09 데이터에서 제거. 레거시 문서 호환용 optional
  level?: number;
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


export interface HobbyCategory {
  id: string;
  name: string;
  items: string[];
}
