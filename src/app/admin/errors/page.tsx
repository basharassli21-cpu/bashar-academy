import { requireRole } from "@/lib/auth/dal";
import { AdminErrorLogPageClient } from "@/components/admin/errors/admin-error-log-page-client";

export default async function AdminErrorsPage() {
  await requireRole(["ADMIN"]);
  return <AdminErrorLogPageClient />;
}
