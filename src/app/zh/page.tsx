import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import LangInit from "@/lib/LangInit";

export const metadata: Metadata = {
  title: "여준수 (余俊秀) — 个人介绍 · 简介",
  description:
    "大学生开发者 여준수（余俊秀）的个人介绍网站。可以查看简介与联系方式。",
  keywords: [
    "여준수",
    "余俊秀",
    "Yeojunsu",
    "大学生开发者",
  ],
  openGraph: {
    title: "여준수 (余俊秀) — 个人介绍",
    description: "大学生开发者 여준수 的个人简介与联系方式",
    locale: "zh_CN",
    url: "https://yeojoonsoo02.com/zh",
  },
  alternates: {
    canonical: "https://yeojoonsoo02.com/zh",
    languages: {
      ko: "https://yeojoonsoo02.com/ko",
      en: "https://yeojoonsoo02.com",
      ja: "https://yeojoonsoo02.com/ja",
      zh: "https://yeojoonsoo02.com/zh",
      "x-default": "https://yeojoonsoo02.com",
    },
  },
};

export default function HomeZh() {
  return (
    <>
      <LangInit lang="zh" />
      <HomeClient />
    </>
  );
}
