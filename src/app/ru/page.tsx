import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import LangInit from "@/lib/LangInit";

export const metadata: Metadata = {
  title: "Yeojunsu (여준수) — Профиль и представление",
  description:
    "Персональный сайт Yeojunsu (여준수), студента-разработчика. Профиль и контактная информация.",
  keywords: ["Yeojunsu", "여준수", "Студент-разработчик", "Фронтенд-разработчик"],
  openGraph: {
    title: "Yeojunsu (여준수) — Профиль",
    description: "Студент-разработчик · Профиль и контакты",
    locale: "ru_RU",
    url: "https://yeojoonsoo02.com/ru",
  },
  alternates: {
    canonical: "https://yeojoonsoo02.com/ru",
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

export default function HomeRu() {
  return (
    <>
      <LangInit lang="ru" />
      <HomeClient />
    </>
  );
}
