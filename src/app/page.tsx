import HomeClient from './HomeClient';
import SEOProfile from '@/components/seo/SEOProfile';
import JsonLd from '@/components/seo/JsonLd';

export default function Home() {
  return (
    <>
      <JsonLd />
      <SEOProfile lang="ko" />
      <HomeClient />
    </>
  );
}
