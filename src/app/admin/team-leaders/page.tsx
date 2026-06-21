import { requireRole } from "@/lib/auth/dal";
import { TeamLeadersPageClient } from "@/components/admin/team-leaders/team-leaders-page-client";

export default async function TeamLeadersPage() {
  await requireRole(["ADMIN"]);
  return <TeamLeadersPageClient />;
}
