import { requireRole } from "@/lib/auth/dal";
import { TeamLeaderDashboardClient } from "@/components/team-leader/team-leader-dashboard-client";

export default async function TeamLeaderDashboardPage() {
  await requireRole(["TEAM_LEADER"]);
  return <TeamLeaderDashboardClient />;
}
