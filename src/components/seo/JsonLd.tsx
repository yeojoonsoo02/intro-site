import { safeJsonLd } from '@/lib/seo-utils';
import {
  buildProfilePageSchema,
  type ProfileLang,
} from './schemas/profilePage';
import { buildWebsiteSchema } from './schemas/website';

interface JsonLdProps {
  // 현재 페이지 언어. 미지정 시 루트 콘텐츠 언어(ko)로 폴백.
  lang?: ProfileLang;
}

export default function JsonLd({ lang = 'ko' }: JsonLdProps): JSX.Element {
  // BreadcrumbList 제거: 전역 단일 항목('home')뿐이라 리치 결과 미생성 + 하위 페이지
  // (/about 등)에서 경로 미반영으로 부정확했음. 계층이 생기면 페이지별로 출력할 것.
  const schemas = [
    buildProfilePageSchema(lang),
    buildWebsiteSchema(lang),
  ];

  return (
    <>
      {schemas.map((schema, idx) => (
        <script
          key={schema['@type'] ?? idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
        />
      ))}
    </>
  );
}
