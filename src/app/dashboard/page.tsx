import { getServerSession } from "next-auth";
import Image from "next/image";
import { redirect } from "next/navigation";
import LogoutButton from "@/features/auth/LogoutButton";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  const { name, email, image } = session.user;
  return (
    <main className="flex flex-col items-center gap-4 mt-20">
      {image && (
        <Image src={image} alt="profile" width={80} height={80} className="rounded-full" />
      )}
      <div>{name}</div>
      <div>{email}</div>
      <LogoutButton />
    </main>
  );
}
