import type { Metadata } from "next";
import Home from "../page";
import LangInit from "@/lib/LangInit";

export const metadata: Metadata = {
  title: "日本語",
  description:
    "ヨ・ジュンスの自己紹介サイトです。プロフィール、趣味、技術スタック、AIチャットなどをご覧いただけます。",
  openGraph: {
    locale: "ja_JP",
  },
  alternates: {
    canonical: "https://yeoweb.vercel.app/ja",
  },
};

export default function HomeJa() {
  return (
    <>
      <LangInit lang="ja" />
      <Home />
    </>
  );
}
