"use client";
import { useAuth } from "@/lib/AuthProvider";
import { useTranslation } from "next-i18next";

export default function LogoutButton() {
  const { logout } = useAuth();
  const { t } = useTranslation();
  return (
    <button className="bg-gray-300 px-3 py-1 rounded" onClick={logout}>
      {t('logout')}
    </button>
  );
}
