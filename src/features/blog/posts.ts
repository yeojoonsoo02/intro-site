export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'hello-yeojoonsoo',
    title: '안녕하세요, 여준수입니다',
    description:
      '대학생 개발자 여준수(Yeo Joonsoo)의 자기소개 사이트에 오신 것을 환영합니다. 제가 누구이고 무엇을 만들며 어디로 가는지 간단히 기록합니다.',
    publishedAt: '2026-04-18',
    tags: ['자기소개', '여준수', '개발자', '블로그'],
    content: `안녕하세요, 대학생 개발자 **여준수(Yeo Joonsoo)** 입니다.

이 사이트 yeojoonsoo02.com 은 저의 공식 프로필 사이트입니다. 앞으로 이 공간에 제가 만드는 프로덕트, 공부하는 기술, 고민하는 문제들을 기록하려 합니다.

## 지금 하는 일

- 개인 비즈니스 통합 관리 플랫폼을 직접 설계하고 운영 중입니다. 고객 관리, 포트폴리오, 재무, 업무를 한곳에서 다루는 도구입니다.
- 프론트엔드 개발에 가장 많은 시간을 쏟고 있습니다. Next.js, TypeScript, React 생태계를 깊이 있게 다룹니다.
- AI 관련 실험을 이어가고 있습니다. 이 사이트에도 AI 채팅 기능을 넣어 보았습니다.

## 앞으로 쓰고 싶은 글

- 혼자 풀스택으로 서비스를 굴릴 때 배운 것들
- Next.js App Router 기반 SEO를 최적화하는 실제 사례 (이 사이트 포함)
- 대학생이 개인 사이트로 개인 브랜딩을 시작하는 방법
- 프로젝트 회고

부담 없이 들러주시고, 궁금한 점이 있다면 yeojoonsoo02@gmail.com 또는 GitHub [yeojoonsoo02](https://github.com/yeojoonsoo02) 로 연락 주세요.

— 여준수 (Yeo Joonsoo)
`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllPostSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
