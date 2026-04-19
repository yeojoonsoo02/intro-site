import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import LangInit from "@/lib/LangInit";
import { buildHreflangLanguages } from "@/lib/seo-utils";

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
    languages: buildHreflangLanguages(),
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
