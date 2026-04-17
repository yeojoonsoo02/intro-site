import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import SEOProfile from "@/components/seo/SEOProfile";
import JsonLd from "@/components/seo/JsonLd";
import LangInit from "@/lib/LangInit";

export const metadata: Metadata = {
  title: "여준수 (ヨ・ジュンス) — 自己紹介・プロフィール",
  description:
    "大学生開発者 여준수（ヨ・ジュンス）の自己紹介サイトです。フロントエンド開発、AI研究、個人プロジェクト、技術スタック、連絡先をご覧いただけます。",
  keywords: [
    "여준수",
    "ヨ・ジュンス",
    "Yeo Joonsoo",
    "yeojoonsoo",
    "大学生開発者",
    "フロントエンド開発者",
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
      "x-default": "https://yeojoonsoo02.com",
    },
  },
};

export default function HomeJa() {
  return (
    <>
      <JsonLd />
      <SEOProfile lang="ja" />
      <LangInit lang="ja" />
      <HomeClient />
    </>
  );
}
