import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import LangInit from "@/lib/LangInit";

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

export default function HomeDe() {
  return (
    <>
      <LangInit lang="de" />
      <HomeClient />
    </>
  );
}
