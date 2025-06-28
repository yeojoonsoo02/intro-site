"use client";
import { useAuth } from "@/lib/AuthProvider";

export default function LogoutButton() {
  const { logout } = useAuth();
  return (
    <button className="bg-gray-300 px-3 py-1 rounded" onClick={logout}>
      Logout
    </button>
  );
}
