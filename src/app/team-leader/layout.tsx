import { requireRole } from "@/lib/auth/dal";
import { TeamLeaderShell } from "@/components/team-leader/team-leader-shell";

export default async function TeamLeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["TEAM_LEADER"]);
  return <TeamLeaderShell user={user}>{children}</TeamLeaderShell>;
}
