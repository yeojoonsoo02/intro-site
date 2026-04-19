import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import LangInit from "@/lib/LangInit";
import { buildHreflangLanguages } from "@/lib/seo-utils";

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
    languages: buildHreflangLanguages(),
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
