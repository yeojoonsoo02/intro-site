import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/lib/AuthProvider";
import I18nProvider from "@/lib/I18nProvider";
import { ThemeProvider } from "@/lib/ThemeProvider";
import TopBar from "@/features/nav/TopBar";
import JsonLd from "@/components/seo/JsonLd";
import type { Lang } from "@/lib/site";

// 명조 헤드라인. 본문 Pretendard는 <head>의 dynamic-subset CSS로 온다(페이지에 나온 글자 조각만 로드).
const serif = Noto_Serif_KR({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

// <html>부터 프로바이더·상단 메뉴까지의 공통 껍데기. 루트 레이아웃 둘((ko)·[lang])과
// global-not-found가 함께 쓴다 — 언어만 다르다.
export default function RootShell({
  lang,
  children,
}: Readonly<{
  lang: Lang;
  children: React.ReactNode;
}>) {
  return (
    <html lang={lang} suppressHydrationWarning className={serif.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* FOUC 방지: 첫 페인트 전에 저장된 테마를 html에 적용. 손상값은 화이트리스트로 폴백 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var valid=['light','dark','system'];if(valid.indexOf(t)===-1){t='system';}var isDark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.remove('dark','light');r.classList.add(isDark?'dark':'light');r.style.colorScheme=isDark?'dark':'light';}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased relative">
        <JsonLd lang={lang} />
        <ThemeProvider>
          <AuthProvider>
            <I18nProvider lang={lang}>
              <TopBar />
              {children}
            </I18nProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
