import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import SEOProfile from "@/components/seo/SEOProfile";
import JsonLd from "@/components/seo/JsonLd";
import LangInit from "@/lib/LangInit";

export const metadata: Metadata = {
  title: "여준수 (Yeo Joonsoo) — 자기소개 · 프로필",
  description:
    "대학생 개발자 여준수의 자기소개 사이트입니다. 프론트엔드 개발, AI 연구, 개인 프로젝트, 기술 스택과 연락처를 확인할 수 있습니다.",
  keywords: [
    "여준수",
    "Yeo Joonsoo",
    "yeojoonsoo",
    "yeojoonsoo02",
    "여준수 개발자",
    "여준수 포트폴리오",
    "여준수 프로필",
    "대학생 개발자",
    "프론트엔드 개발자",
  ],
  openGraph: {
    title: "여준수 (Yeo Joonsoo) — 자기소개",
    description:
      "대학생 개발자 여준수의 자기소개 · 프로필 · 연락처",
    locale: "ko_KR",
    url: "https://yeojoonsoo02.com/ko",
  },
  alternates: {
    canonical: "https://yeojoonsoo02.com/ko",
    languages: {
      ko: "https://yeojoonsoo02.com/ko",
      en: "https://yeojoonsoo02.com",
      ja: "https://yeojoonsoo02.com/ja",
      zh: "https://yeojoonsoo02.com/zh",
      "x-default": "https://yeojoonsoo02.com",
    },
  },
};

export default function HomeKo() {
  return (
    <>
      <JsonLd />
      <SEOProfile lang="ko" />
      <LangInit lang="ko" />
      <HomeClient />
    </>
  );
}
