import type { Profile } from './profile.model';

// Single default profile - content stays the same across all languages
// Only UI labels are translated via i18n
export const DEFAULT_PROFILES: Record<string, Profile> = {
  en: {
    name: 'Junsu Yeo',
    tagline: 'Student Developer',
    email: 'yeojoonsoo02@gmail.com',
    photo: '/profile.jpg',
    interests: ['Frontend development', 'AI research', 'Music', 'Travel'],
    intro: [
      "Hi, I'm Junsu, a college student and developer.",
      'In my free time I enjoy exploring new technologies and working on personal projects.',
    ],
    region: 'Incheon, South Korea',
  },
};
