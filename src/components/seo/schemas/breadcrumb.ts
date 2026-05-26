import { SITE_URL } from './constants';

export const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: '여준수',
      item: SITE_URL,
    },
  ],
};
