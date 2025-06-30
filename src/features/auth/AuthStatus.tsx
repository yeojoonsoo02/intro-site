"use client";
import Image from "next/image";
import { useAuth } from "@/lib/AuthProvider";
import { useTranslation } from "next-i18next";

export default function AuthStatus() {
  const { t } = useTranslation();
  const { user, login, logout } = useAuth();

  if (!user) {
    return (
      <button
        type="button"
        onClick={login}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium border border-blue-300 rounded-full bg-white text-blue-700 hover:bg-blue-100 transition"
      >
        <span>🔑</span> <span>{t('signIn')}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {user.photoURL ? (
        <Image
          src={user.photoURL}
          alt="profile"
          width={32}
          height={32}
          className="rounded-full"
        />
      ) : (
        <span className="text-sm">{user.email}</span>
      )}
      <button
        type="button"
        onClick={logout}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium border border-blue-300 rounded-full bg-white text-blue-700 hover:bg-blue-100 transition"
      >
        {t('logout')}
      </button>
    </div>
  );
}
