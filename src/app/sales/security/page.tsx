import { requireRole } from "@/lib/auth/dal";
import { AccountSecurityPageClient } from "@/components/security/account-security-page-client";

export default async function SalesSecurityPage() {
  const user = await requireRole(["SALES_EMPLOYEE"]);
  return <AccountSecurityPageClient initialTotpEnabled={user.totpEnabled} />;
}
