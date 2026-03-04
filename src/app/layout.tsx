import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/lib/AuthProvider";
import I18nProvider from "@/lib/I18nProvider";
import { ThemeProvider } from "@/lib/ThemeProvider";
import TopBar from "@/features/nav/TopBar";

export const metadata: Metadata = {
  metadataBase: new URL("https://yeojoonsoo02.com"),
  title: {
    default: "여준수 | 자기소개 사이트",
    template: "%s | 여준수",
  },
  description:
    "여준수의 자기소개 사이트입니다. 프로필, 취미, 기술 스택, AI 채팅 등을 확인할 수 있습니다.",
  openGraph: {
    title: "여준수 | 자기소개 사이트",
    description:
      "여준수의 자기소개 사이트입니다. 프로필, 취미, 기술 스택, AI 채팅 등을 확인할 수 있습니다.",
    url: "https://yeojoonsoo02.com",
    siteName: "여준수 자기소개",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "여준수 | 자기소개 사이트",
    description:
      "여준수의 자기소개 사이트입니다. 프로필, 취미, 기술 스택, AI 채팅 등을 확인할 수 있습니다.",
  },
  alternates: {
    canonical: "https://yeojoonsoo02.com",
    languages: {
      ko: "/ko",
      ja: "/ja",
      zh: "/zh",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased relative">
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
