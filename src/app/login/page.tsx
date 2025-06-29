"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import PromptBox from "@/features/prompt/PromptBox";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  return (
    <>
      <main className="flex flex-col items-center justify-center gap-4 mt-20 pb-32">
        <div className="flex gap-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={async () => {
              await login();
              router.push("/dashboard");
            }}
          >
            Login with Google
          </button>
          <button
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
            onClick={() => setShowPrompt(!showPrompt)}
          >
            Prompt
          </button>
        </div>
      </main>
      <PromptBox open={showPrompt} />
    </>
  );
}
