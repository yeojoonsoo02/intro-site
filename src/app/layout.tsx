import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/lib/AuthProvider";
import I18nProvider from "@/lib/I18nProvider";
import TopBar from "@/features/nav/TopBar";

export const metadata: Metadata = {
  title: "yeojoonsoo02",
  description: "yeojoonsoo02",
  icons: {
    icon: "/favicon.ico?v=1",
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
        <AuthProvider>
          <I18nProvider>
            <TopBar />
            {children}
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
