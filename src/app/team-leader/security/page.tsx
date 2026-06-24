import { requireRole } from "@/lib/auth/dal";
import { AccountSecurityPageClient } from "@/components/security/account-security-page-client";

export default async function TeamLeaderSecurityPage() {
  const user = await requireRole(["TEAM_LEADER"]);
  return <AccountSecurityPageClient initialTotpEnabled={user.totpEnabled} />;
}
