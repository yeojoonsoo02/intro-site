"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center gap-4 mt-20">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      >
        Login with Google
      </button>
      <button
        className="bg-yellow-400 text-white px-4 py-2 rounded"
        onClick={() => signIn("kakao", { callbackUrl: "/dashboard" })}
      >
        Login with Kakao
      </button>
    </main>
  );
}
