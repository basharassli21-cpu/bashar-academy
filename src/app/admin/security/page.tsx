import { requireRole } from "@/lib/auth/dal";
import { AdminSecurityPageClient } from "@/components/admin/security/admin-security-page-client";

export default async function AdminSecurityPage() {
  const user = await requireRole(["ADMIN"]);
  return <AdminSecurityPageClient initialTotpEnabled={user.totpEnabled} />;
}
