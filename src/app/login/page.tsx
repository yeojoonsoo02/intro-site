"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { useTranslation } from "next-i18next";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  return (
    <main className="flex flex-col items-center justify-center gap-4 mt-20">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={async () => {
          await login();
          router.push("/");
        }}
      >
        {t('loginWithGoogle')}
      </button>
    </main>
  );
}
