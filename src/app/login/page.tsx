"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { useTranslation } from "react-i18next";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  // 로딩 중에는 빈 화면 대신 인디케이터 노출 (다른 페이지의 t('loading') 패턴 참고)
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <p style={{ color: "var(--muted)" }}>{t('loading')}</p>
      </main>
    );
  }
  if (user) return null;

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8 flex flex-col items-center gap-6 mx-4"
        style={{
          background: "var(--card-bg)",
          boxShadow: "var(--card-shadow)",
          border: "1px solid var(--border)",
        }}
      >
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--foreground)" }}
        >
          {t('signIn')}
        </h1>
        <button
          className="w-full py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
          style={{
            background: "var(--primary)",
            color: "var(--primary-contrast)",
          }}
          onClick={() => login()}
        >
          {t('loginWithGoogle')}
        </button>
      </div>
    </main>
  );
}
