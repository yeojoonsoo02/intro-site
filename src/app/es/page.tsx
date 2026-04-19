import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import LangInit from "@/lib/LangInit";

export const metadata: Metadata = {
  title: "Yeojunsu (여준수) — Perfil y presentación",
  description:
    "Sitio personal de Yeojunsu (여준수), estudiante desarrollador. Consulta el perfil y los datos de contacto.",
  keywords: ["Yeojunsu", "여준수", "Estudiante desarrollador", "Desarrollador Frontend"],
  openGraph: {
    title: "Yeojunsu (여준수) — Perfil",
    description: "Estudiante desarrollador · Perfil y contacto",
    locale: "es_ES",
    url: "https://yeojoonsoo02.com/es",
  },
  alternates: {
    canonical: "https://yeojoonsoo02.com/es",
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

export default function HomeEs() {
  return (
    <>
      <LangInit lang="es" />
      <HomeClient />
    </>
  );
}
