import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import LangInit from "@/lib/LangInit";
import { buildHreflangLanguages } from "@/lib/seo-utils";

export const metadata: Metadata = {
  title: "Junsu Yeo (여준수) — Профиль и представление",
  description:
    "Персональный сайт Junsu Yeo (여준수), студента-разработчика. Профиль и контактная информация.",
  keywords: ["Junsu Yeo", "여준수", "Студент-разработчик", "Фронтенд-разработчик"],
  openGraph: {
    title: "Junsu Yeo (여준수) — Профиль",
    description: "Студент-разработчик · Профиль и контакты",
    locale: "ru_RU",
    url: "https://yeojoonsoo02.com/ru",
  },
  alternates: {
    canonical: "https://yeojoonsoo02.com/ru",
    languages: buildHreflangLanguages(),
  },
};

export default function HomeRu() {
  return (
    <>
      <LangInit lang="ru" />
      <HomeClient />
    </>
  );
}
