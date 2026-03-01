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
    if (user) router.replace("/");
  }, [user, router]);

  if (loading) return null;
  if (user) return null;

  return (
    <main className="flex flex-col items-center justify-center gap-4 mt-20">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => login()}
      >
        {t('loginWithGoogle')}
      </button>
    </main>
  );
}
