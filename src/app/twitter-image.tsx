import {
  OG_ALT,
  OG_SIZE,
  OG_CONTENT_TYPE,
  renderOgImage,
} from '@/components/seo/ogImageTemplate';

export const runtime = 'edge';
export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function TwitterImage() {
  return renderOgImage();
}
