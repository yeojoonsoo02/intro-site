import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/lib/AuthProvider";
import I18nProvider from "@/lib/I18nProvider";
import { ThemeProvider } from "@/lib/ThemeProvider";
import TopBar from "@/features/nav/TopBar";

export const metadata: Metadata = {
  metadataBase: new URL("https://yeoweb.vercel.app"),
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
    url: "https://yeoweb.vercel.app",
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
    canonical: "https://yeoweb.vercel.app",
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
    <html lang="en" suppressHydrationWarning>
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
