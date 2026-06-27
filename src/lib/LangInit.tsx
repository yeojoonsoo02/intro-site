"use client";

import { useEffect } from "react";
import i18n from "@/lib/i18n";

export default function LangInit({ lang }: { lang: string }) {
  useEffect(() => {
    i18n.changeLanguage(lang);
    // 언어 상태 저장소를 'lang' 하나로 통일 (i18n detection도 동일 키 사용).
    localStorage.setItem("lang", lang);
    // 미들웨어가 루트 진입 시 참조하는 NEXT_LOCALE 쿠키도 함께 동기화해
    // 사용자가 선택한 언어가 서버 리다이렉트에서도 존중되게 한다. (1년 보관)
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
