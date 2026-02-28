import type { Metadata } from "next";
import Home from "../page";
import LangInit from "@/lib/LangInit";

export const metadata: Metadata = {
  title: "中文",
  description:
    "吕俊秀的自我介绍网站。可以查看个人简介、爱好、技术栈、AI聊天等内容。",
  openGraph: {
    locale: "zh_CN",
  },
  alternates: {
    canonical: "https://yeojoonsoo02.com/zh",
  },
};

export default function HomeZh() {
  return (
    <>
      <LangInit lang="zh" />
      <Home />
    </>
  );
}
