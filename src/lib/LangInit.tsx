"use client";

import { useEffect } from "react";
import i18n from "@/lib/i18n";

export default function LangInit({ lang }: { lang: string }) {
  useEffect(() => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
