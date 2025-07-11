"use client";

import { useEffect } from "react";
import i18n from "@/lib/i18n";
import Home from "../page";

export default function HomeZh() {
  useEffect(() => {
    i18n.changeLanguage("zh");
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", "zh");
      document.documentElement.lang = "zh";
    }
  }, []);
  return <Home />;
}
