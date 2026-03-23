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
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 flex flex-col items-center gap-5"
        style={{
          background: "var(--card-bg)",
          boxShadow: "var(--card-shadow)",
          border: "1px solid var(--border)",
        }}
      >
        {photoURL ? (
          <Image
            src={photoURL}
            alt="profile"
            width={96}
            height={96}
            className="rounded-full"
            style={{ border: "4px solid var(--border)" }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
            style={{
              background: "color-mix(in srgb, var(--primary) 15%, transparent)",
              color: "var(--primary)",
            }}
          >
            {displayName?.[0] ?? "?"}
          </div>
        )}

        <div className="text-center">
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            {t("welcomeUser", { name: displayName ?? t("user") })}
          </h1>
          {email && (
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              {email}
            </p>
          )}
        </div>

        <div className="w-full flex flex-col gap-3 mt-2">
          <button
            onClick={() => router.push("/")}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: "var(--primary)",
              color: "var(--primary-contrast)",
            }}
          >
            {t("goHome")}
          </button>
          <button
            onClick={logout}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              background: "transparent",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            }}
          >
            {t("logout")}
          </button>
        </div>
      </div>
    </main>
  );
}
