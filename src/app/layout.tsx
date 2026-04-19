import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/lib/AuthProvider";
import I18nProvider from "@/lib/I18nProvider";
import { ThemeProvider } from "@/lib/ThemeProvider";
import TopBar from "@/features/nav/TopBar";
import SEOProfile from "@/components/seo/SEOProfile";
import JsonLd from "@/components/seo/JsonLd";

const SITE_URL = "https://yeojoonsoo02.com";
const SITE_NAME = "여준수 (Yeojunsu)";
const DEFAULT_TITLE = "여준수 (Yeojunsu) — 대학생 개발자 자기소개";
const DEFAULT_DESC =
  "여준수(Yeojunsu) 공식 자기소개 사이트. 대학생 개발자의 프로필과 연락처를 확인할 수 있습니다.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | 여준수",
  },
  description: DEFAULT_DESC,
  applicationName: SITE_NAME,
  authors: [{ name: "여준수", url: SITE_URL }],
  creator: "여준수",
  publisher: "여준수",
  keywords: [
    "여준수",
    "Yeojunsu",
    "yeojoonsoo02",
    "여준수 개발자",
    "여준수 프로필",
    "여준수 자기소개",
    "대학생 개발자",
    "余俊秀",
    "ヨ・ジュンス",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "여준수 | 자기소개 사이트",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    locale: "ko_KR",
    alternateLocale: ["en_US", "ja_JP", "zh_CN", "es_ES", "fr_FR", "de_DE", "pt_BR", "ru_RU"],
    // OG 이미지는 app/opengraph-image.tsx 파일 컨벤션으로 자동 주입됨(1200x630 동적 생성)
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    // Twitter 이미지도 app/twitter-image.tsx 파일 컨벤션으로 자동 주입
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      ko: `${SITE_URL}/ko`,
      en: SITE_URL,
      ja: `${SITE_URL}/ja`,
      zh: `${SITE_URL}/zh`,
      es: `${SITE_URL}/es`,
      fr: `${SITE_URL}/fr`,
      de: `${SITE_URL}/de`,
      pt: `${SITE_URL}/pt`,
      ru: `${SITE_URL}/ru`,
      "x-default": SITE_URL,
    },
  },
  verification: {
    other: {
      "naver-site-verification": "5adb43fad5cb5127cf287096d862f052ae1dd921",
    },
  },
  category: "personal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="여준수 블로그 RSS"
          href="/rss.xml"
        />
        {/* LCP 이미지(프로필 사진) preload — 초기 렌더 지연 감소 */}
        <link
          rel="preload"
          as="image"
          href="/profile.jpg"
          // @ts-expect-error fetchPriority는 next types에 아직 없지만 HTML 표준이라 동작함
          fetchpriority="high"
        />
      </head>
      <body className="antialiased relative">
        <JsonLd />
        <SEOProfile lang="ko" />
        <ThemeProvider>
          <AuthProvider>
            <I18nProvider>
              <TopBar />
              {children}
            </I18nProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
