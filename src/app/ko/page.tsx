import type { Metadata } from "next";
import Home from "../page";
import LangInit from "@/lib/LangInit";

export const metadata: Metadata = {
  title: "한국어",
  description:
    "여준수의 자기소개 사이트입니다. 프로필, 취미, 기술 스택, AI 채팅 등을 확인할 수 있습니다.",
  openGraph: {
    locale: "ko_KR",
  },
  alternates: {
    canonical: "https://yeojoonsoo02.com/ko",
  },
};

export default function HomeKo() {
  return (
    <>
      <LangInit lang="ko" />
      <Home />
    </>
  );
}
