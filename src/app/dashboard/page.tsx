"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { useTranslation } from "react-i18next";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) return null;

  const { displayName, email, photoURL } = user;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-8 flex flex-col items-center gap-5">
        {photoURL ? (
          <Image
            src={photoURL}
            alt="profile"
            width={96}
            height={96}
            className="rounded-full border-4 border-gray-100 dark:border-zinc-700"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-300">
            {displayName?.[0] ?? "?"}
          </div>
        )}

        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t("welcomeUser", { name: displayName ?? t("user") })}
          </h1>
          {email && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {email}
            </p>
          )}
        </div>

        <div className="w-full flex flex-col gap-3 mt-2">
          <button
            onClick={() => router.push("/")}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            {t("goHome")}
          </button>
          <button
            onClick={logout}
            className="w-full py-2.5 rounded-lg border border-gray-300 dark:border-zinc-600 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
          >
            {t("logout")}
          </button>
        </div>
      </div>
    </main>
  );
}
