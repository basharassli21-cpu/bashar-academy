import { requireRole } from "@/lib/auth/dal";
import { AccountSecurityPageClient } from "@/components/security/account-security-page-client";

export default async function AdminSecurityPage() {
  const user = await requireRole(["ADMIN"]);
  return <AccountSecurityPageClient initialTotpEnabled={user.totpEnabled} />;
}
