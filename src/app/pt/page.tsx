import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import LangInit from "@/lib/LangInit";
import { buildHreflangLanguages } from "@/lib/seo-utils";

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
    languages: buildHreflangLanguages(),
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
