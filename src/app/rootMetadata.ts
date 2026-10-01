import type { Metadata, Viewport } from "next";
import { hreflangFor, SITE_URL } from "@/lib/site";
import { OG_IMAGES, TWITTER_IMAGES } from "@/components/seo/ogMeta";

// 루트 레이아웃이 둘이라((ko)·[lang]) 공통 메타데이터를 여기 한 번만 둔다.
const SITE_NAME = "여준수 (Junsu Yeo)";
const DEFAULT_TITLE = "여준수 (Junsu Yeo) — 대학생 개발자 자기소개";
const DEFAULT_DESC =
  "여준수(Junsu Yeo) 공식 자기소개 사이트. 대학생 개발자의 프로필과 연락처를 확인할 수 있습니다.";

export const ROOT_METADATA: Metadata = {
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
    "Junsu Yeo",
    "Yeojunsu",
    "yeojoonsoo02",
    "여준수 개발자",
    "여준수 프로필",
    "여준수 자기소개",
    "대학생 개발자",
    "呂晙壽",
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
    images: OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    images: TWITTER_IMAGES,
  },
  alternates: {
    canonical: SITE_URL,
    languages: hreflangFor(),
  },
  verification: {
    // 파일 방식 인증(google9174e807949ac6f5.html)을 메타 태그로 이중 보강.
    // 파일을 정리해도 GSC가 메타 태그로 fallback할 수 있도록.
    google: "9174e807949ac6f5",
    other: {
      "naver-site-verification": "5adb43fad5cb5127cf287096d862f052ae1dd921",
      // Bing/Yandex는 env에 값이 있을 때만 메타 태그 출력. 빈 메타 노출 방지.
      ...(process.env.NEXT_PUBLIC_BING_VERIFICATION
        ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION }
        : {}),
      ...(process.env.NEXT_PUBLIC_YANDEX_VERIFICATION
        ? { "yandex-verification": process.env.NEXT_PUBLIC_YANDEX_VERIFICATION }
        : {}),
    },
  },
  category: "personal",
};

// 모바일 주소창까지 테마를 따라가게 한다. Next 16은 viewport를 별도 export로 받는다.
export const ROOT_VIEWPORT: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fb" },
    { media: "(prefers-color-scheme: dark)", color: "#15171c" },
  ],
};
