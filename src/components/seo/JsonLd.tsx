import { safeJsonLd } from '@/lib/seo-utils';
import {
  buildProfilePageSchema,
  type ProfileLang,
} from './schemas/profilePage';
import { websiteSchema } from './schemas/website';
import { breadcrumbSchema } from './schemas/breadcrumb';

interface JsonLdProps {
  // 현재 페이지 언어. 미지정 시 루트 콘텐츠 언어(ko)로 폴백.
  lang?: ProfileLang;
}

export default function JsonLd({ lang = 'ko' }: JsonLdProps): JSX.Element {
  const schemas = [
    buildProfilePageSchema(lang),
    websiteSchema,
    breadcrumbSchema,
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
