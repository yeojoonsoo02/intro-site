"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LogoutButton from "@/features/auth/LogoutButton";
import { useAuth } from "@/lib/AuthProvider";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  const { displayName, email, photoURL } = user;

  return (
    <main className="flex flex-col items-center gap-4 mt-20">
      {photoURL && (
        <Image src={photoURL} alt="profile" width={80} height={80} className="rounded-full" />
      )}
      <div>{displayName}</div>
      <div>{email}</div>
      <LogoutButton />
    </main>
  );
}
