import { safeJsonLd } from '@/lib/seo-utils';
import { profilePageSchema } from './schemas/profilePage';
import { websiteSchema } from './schemas/website';
import { breadcrumbSchema } from './schemas/breadcrumb';

const SCHEMAS = [profilePageSchema, websiteSchema, breadcrumbSchema];

export default function JsonLd(): JSX.Element {
  return (
    <>
      {SCHEMAS.map((schema, idx) => (
        <script
          key={schema['@type'] ?? idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
        />
      ))}
    </>
  );
}
