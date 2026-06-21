import { requireRole } from "@/lib/auth/dal";
import { AdminLeadsPageClient } from "@/components/admin/leads/admin-leads-page-client";

export default async function AdminLeadsPage() {
  await requireRole(["ADMIN"]);
  return <AdminLeadsPageClient />;
}
