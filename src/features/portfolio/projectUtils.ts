import type { Project, ProjectStatus } from './portfolio.model';

/** 상태 → 로케일 키. 값이 없거나 모르는 값이면 표시하지 않는다. */
export function statusKey(status: Project['status']): string | null {
  const known: ProjectStatus[] = ['live', 'private', 'archived', 'wip'];
  return status && known.includes(status) ? `status_${status}` : null;
}

/** 카드·헤더 한 줄. summary가 없으면 description의 첫 문장으로 대신한다. */
export function oneLiner(project: Project): string {
  if (project.summary?.trim()) return project.summary.trim();
  const first = project.description.split(/(?<=[.。!?])\s+/)[0] ?? project.description;
  return first.trim();
}

export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

/** 대표(featured) 3개와 나머지. featured가 하나도 없으면 order 상위 3개를 대표로 삼는다. */
export function splitProjects(projects: Project[]): { featured: Project[]; archive: Project[] } {
  const sorted = sortByOrder(projects);
  const flagged = sorted.filter((p) => p.featured);
  const featured = (flagged.length > 0 ? flagged : sorted).slice(0, 3);
  const ids = new Set(featured.map((p) => p.id));
  return { featured, archive: sorted.filter((p) => !ids.has(p.id)) };
}
