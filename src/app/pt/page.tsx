import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import LangInit from "@/lib/LangInit";

export const metadata: Metadata = {
  title: "Yeojunsu (여준수) — Perfil e apresentação",
  description:
    "Site pessoal de Yeojunsu (여준수), estudante desenvolvedor. Perfil e informações de contato.",
  keywords: ["Yeojunsu", "여준수", "Estudante desenvolvedor", "Desenvolvedor Frontend"],
  openGraph: {
    title: "Yeojunsu (여준수) — Perfil",
    description: "Estudante desenvolvedor · Perfil e contato",
    locale: "pt_BR",
    url: "https://yeojoonsoo02.com/pt",
  },
  alternates: {
    canonical: "https://yeojoonsoo02.com/pt",
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

export default function HomePt() {
  return (
    <>
      <LangInit lang="pt" />
      <HomeClient />
    </>
  );
}
