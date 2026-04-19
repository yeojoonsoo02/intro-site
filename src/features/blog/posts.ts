export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  content: string;
}

// 실제 본인이 작성한 글만 여기에 추가. 비어있으면 /blog 페이지에서 "글 없음" 상태 표시.
export const BLOG_POSTS: BlogPost[] = [];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllPostSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
