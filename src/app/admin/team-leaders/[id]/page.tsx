import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { TeamLeaderRoster } from "@/components/admin/team-leaders/team-leader-roster";

export default async function TeamLeaderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { id } = await params;

  const leader = await prisma.user.findUnique({
    where: { id },
    select: { id: true, fullName: true, username: true, role: true },
  });

  if (!leader || leader.role !== "TEAM_LEADER") notFound();

  return <TeamLeaderRoster leaderId={leader.id} leaderName={leader.fullName} />;
}
