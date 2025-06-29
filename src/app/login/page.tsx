"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  return (
    <main className="flex flex-col items-center justify-center gap-4 mt-20">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={async () => {
          await login();
          router.push("/dashboard");
        }}
      >
        Login with Google
      </button>
    </main>
  );
}
