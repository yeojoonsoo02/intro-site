import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import AuthProvider from "@/lib/AuthProvider";
import I18nProvider from "@/lib/I18nProvider";
import { ThemeProvider } from "@/lib/ThemeProvider";
import TopBar from "@/features/nav/TopBar";
import SEOProfile from "@/components/seo/SEOProfile";
import JsonLd from "@/components/seo/JsonLd";
import { buildHreflangLanguages } from "@/lib/seo-utils";
import { LANG_CODES } from "@/lib/i18n-config";

const SITE_URL = "https://yeojoonsoo02.com";
const SITE_NAME = "여준수 (Yeojunsu)";
const DEFAULT_TITLE = "여준수 (Yeojunsu) — 대학생 개발자 자기소개";
const DEFAULT_DESC =
  "여준수(Yeojunsu) 공식 자기소개 사이트. 대학생 개발자의 프로필과 연락처를 확인할 수 있습니다.";

type Lang = 'ko' | 'en' | 'ja' | 'zh' | 'es' | 'fr' | 'de' | 'pt' | 'ru';

function detectLang(pathname: string): Lang {
  // 첫 경로 세그먼트만 추출해 정확히 언어 코드와 일치할 때만 판정.
  // startsWith 접두 매칭은 /japan-trip 같은 경로를 /ja로 오분류하므로 사용하지 않음.
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  if (firstSegment && (LANG_CODES as readonly string[]).includes(firstSegment)) {
    return firstSegment as Lang;
  }
  // root('/')는 실제 노출 콘텐츠가 한국어(이름·자기소개·관심사)라 ko로 매핑.
  // 검색엔진의 언어 시그널(html lang)과 콘텐츠를 일치시켜 색인 품질을 높임.
  return 'ko';
}

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
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    site: "@yeojoonsoo02",
    creator: "@yeojoonsoo02",
    // twitter 이미지는 파일 규약(twitter-image.tsx)에 일임.
    // 수동 지정은 규약 라우트를 shadowing하므로 제거. openGraph도 동일하게
    // opengraph-image.tsx 규약을 그대로 사용(수동 지정 없음).
  },
  alternates: {
    canonical: SITE_URL,
    languages: buildHreflangLanguages(),
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const pathname = h.get('x-pathname') || '/';
  const lang = detectLang(pathname);

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        {/* FOUC 방지: 첫 페인트 전에 저장된 테마를 html에 적용. 손상값은 화이트리스트로 폴백 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var valid=['light','dark','system'];if(valid.indexOf(t)===-1){t='system';}var isDark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.remove('dark','light');r.classList.add(isDark?'dark':'light');r.style.colorScheme=isDark?'dark':'light';}catch(e){}})();`,
          }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* LCP 이미지(프로필 사진) preload — 초기 렌더 지연 감소 */}
        <link
          rel="preload"
          as="image"
          href="/profile.jpg"
          fetchPriority="high"
        />
      </head>
      <body className="antialiased relative">
        <JsonLd lang={lang} />
        <SEOProfile lang={lang} />
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
