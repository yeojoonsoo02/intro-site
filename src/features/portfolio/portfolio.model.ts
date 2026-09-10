export type ProjectStatus = 'live' | 'private' | 'archived' | 'wip';

/** 기술·설계 선택과 그 이유. 이유를 모르면 항목을 넣지 않는다. */
export interface ProjectDecision {
  what: string;
  why: string;
}

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
  // --- 케이스 스터디 (전부 optional, 비어 있으면 UI가 그 섹션을 숨긴다) ---
  /** 카드·헤더용 한 줄 요약 */
  summary?: string;
  status?: ProjectStatus;
  /** "2025.03 ~ 운영 중" */
  period?: string;
  /** "단독 개발 (기획·디자인·개발·배포)" */
  role?: string;
  /** 배경·의뢰 이유 */
  context?: string;
  /** 풀려던 문제 */
  problem?: string;
  decisions?: ProjectDecision[];
  /** 구현 포인트·난관과 해결 */
  highlights?: string[];
  /** 결과. 수치가 있을 때만 수치, 없으면 정성 사실 */
  outcome?: string[];
  lessons?: string;
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
