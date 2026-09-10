import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import LangInit from "@/lib/LangInit";
import { buildHreflangLanguages } from "@/lib/seo-utils";

export const metadata: Metadata = {
  title: "Junsu Yeo — About · Profile",
  description:
    "Personal introduction site of Junsu Yeo, a university student developer. View his profile and contact information.",
  keywords: [
    "여준수",
    "Junsu Yeo",
    "yeojoonsoo02",
    "university student developer",
  ],
  openGraph: {
    title: "Junsu Yeo — About",
    description: "University student developer Junsu Yeo — profile and contact",
    locale: "en_US",
    url: "https://yeojoonsoo02.com/en",
  },
  alternates: {
    canonical: "https://yeojoonsoo02.com/en",
    languages: buildHreflangLanguages(),
  },
};

export default function HomeEn() {
  return (
    <>
      <LangInit lang="en" />
      <HomeClient />
    </>
  );
}
