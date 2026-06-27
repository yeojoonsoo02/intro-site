import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import LangInit from "@/lib/LangInit";
import { buildHreflangLanguages } from "@/lib/seo-utils";

export const metadata: Metadata = {
  title: "Yeojunsu — About · Profile",
  description:
    "Personal introduction site of Yeojunsu, a university student developer. View his profile and contact information.",
  keywords: [
    "여준수",
    "Yeojunsu",
    "yeojoonsoo02",
    "university student developer",
  ],
  openGraph: {
    title: "Yeojunsu — About",
    description: "University student developer Yeojunsu — profile and contact",
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
