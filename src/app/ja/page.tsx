"use client";

import { useEffect } from "react";
import i18n from "@/lib/i18n";
import Home from "../page";

export default function HomeJa() {
  useEffect(() => {
    i18n.changeLanguage("ja");
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", "ja");
      document.documentElement.lang = "ja";
    }
  }, []);
  return <Home />;
}
