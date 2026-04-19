import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import LangInit from "@/lib/LangInit";

export const metadata: Metadata = {
  title: "여준수 (ヨ・ジュンス) — 自己紹介・プロフィール",
  description:
    "大学生開発者 여준수（ヨ・ジュンス）の自己紹介サイトです。プロフィールと連絡先をご覧いただけます。",
  keywords: [
    "여준수",
    "ヨ・ジュンス",
    "Yeojunsu",
    "大学生開発者",
  ],
  openGraph: {
    title: "여준수 (ヨ・ジュンス) — 自己紹介",
    description: "大学生開発者 여준수のプロフィールと連絡先",
    locale: "ja_JP",
    url: "https://yeojoonsoo02.com/ja",
  },
  alternates: {
    canonical: "https://yeojoonsoo02.com/ja",
    languages: {
      ko: "https://yeojoonsoo02.com/ko",
      en: "https://yeojoonsoo02.com",
      ja: "https://yeojoonsoo02.com/ja",
      zh: "https://yeojoonsoo02.com/zh",
      es: "https://yeojoonsoo02.com/es",
      fr: "https://yeojoonsoo02.com/fr",
      de: "https://yeojoonsoo02.com/de",
      pt: "https://yeojoonsoo02.com/pt",
      ru: "https://yeojoonsoo02.com/ru",
      "x-default": "https://yeojoonsoo02.com",
    },
  },
};

export default function HomeJa() {
  return (
    <>
      <LangInit lang="ja" />
      <HomeClient />
    </>
  );
}
