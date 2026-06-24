import { getCurrentUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "@/components/academy/profile-client";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true, phone: true },
  });

  return (
    <ProfileClient
      user={user}
      email={dbUser?.email ?? null}
      phone={dbUser?.phone ?? null}
    />
  );
}
