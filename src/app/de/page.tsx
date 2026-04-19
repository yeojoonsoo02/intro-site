import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import LangInit from "@/lib/LangInit";
import { buildHreflangLanguages } from "@/lib/seo-utils";

export const metadata: Metadata = {
  title: "Yeojunsu (여준수) — Profil und Vorstellung",
  description:
    "Persönliche Seite von Yeojunsu (여준수), studentischer Entwickler. Profil und Kontaktdaten.",
  keywords: ["Yeojunsu", "여준수", "Studentischer Entwickler", "Frontend-Entwickler"],
  openGraph: {
    title: "Yeojunsu (여준수) — Profil",
    description: "Studentischer Entwickler · Profil und Kontakt",
    locale: "de_DE",
    url: "https://yeojoonsoo02.com/de",
  },
  alternates: {
    canonical: "https://yeojoonsoo02.com/de",
    languages: buildHreflangLanguages(),
  },
};

export default function HomeDe() {
  return (
    <>
      <LangInit lang="de" />
      <HomeClient />
    </>
  );
}
