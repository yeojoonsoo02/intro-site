import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import LangInit from "@/lib/LangInit";

export const metadata: Metadata = {
  title: "Yeojunsu (여준수) — Profil et présentation",
  description:
    "Site personnel de Yeojunsu (여준수), étudiant développeur. Profil et coordonnées.",
  keywords: ["Yeojunsu", "여준수", "Étudiant développeur", "Développeur Frontend"],
  openGraph: {
    title: "Yeojunsu (여준수) — Profil",
    description: "Étudiant développeur · Profil et contact",
    locale: "fr_FR",
    url: "https://yeojoonsoo02.com/fr",
  },
  alternates: {
    canonical: "https://yeojoonsoo02.com/fr",
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

export default function HomeFr() {
  return (
    <>
      <LangInit lang="fr" />
      <HomeClient />
    </>
  );
}
