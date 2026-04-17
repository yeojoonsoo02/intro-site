import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/lib/AuthProvider";
import I18nProvider from "@/lib/I18nProvider";
import { ThemeProvider } from "@/lib/ThemeProvider";
import TopBar from "@/features/nav/TopBar";
import SEOProfile from "@/components/seo/SEOProfile";
import JsonLd from "@/components/seo/JsonLd";

const SITE_URL = "https://yeojoonsoo02.com";
const SITE_NAME = "여준수 (Yeo Joonsoo)";
const DEFAULT_TITLE = "여준수 (Yeo Joonsoo) — 대학생 개발자 자기소개 · 포트폴리오";
const DEFAULT_DESC =
  "여준수(Yeo Joonsoo) 공식 자기소개 사이트. 대학생 개발자의 프로필, 프론트엔드 개발, AI 연구, 개인 프로젝트, 기술 스택 및 연락처를 확인할 수 있습니다.";

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
    "Yeo Joonsoo",
    "yeojoonsoo",
    "yeojoonsoo02",
    "여준수 개발자",
    "여준수 포트폴리오",
    "여준수 프로필",
    "여준수 자기소개",
    "대학생 개발자",
    "프론트엔드 개발자",
    "Junsu Yeo",
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
    alternateLocale: ["en_US", "ja_JP", "zh_CN"],
    images: [
      {
        url: "/profile.jpg",
        width: 800,
        height: 800,
        alt: "여준수 (Yeo Joonsoo) 프로필 사진",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    images: ["/profile.jpg"],
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      ko: `${SITE_URL}/ko`,
      en: SITE_URL,
      ja: `${SITE_URL}/ja`,
      zh: `${SITE_URL}/zh`,
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
