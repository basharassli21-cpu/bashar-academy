import { requireRole } from "@/lib/auth/dal";
import { AdminAuditLogPageClient } from "@/components/admin/audit-log/admin-audit-log-page-client";

export default async function AdminAuditLogPage() {
  await requireRole(["ADMIN"]);
  return <AdminAuditLogPageClient />;
}
