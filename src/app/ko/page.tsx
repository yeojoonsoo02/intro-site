"use client";

import { useEffect } from "react";
import i18n from "@/lib/i18n";
import Home from "../page";

export default function HomeKo() {
  useEffect(() => {
    i18n.changeLanguage("ko");
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", "ko");
      document.documentElement.lang = "ko";
    }
  }, []);
  return <Home />;
}
