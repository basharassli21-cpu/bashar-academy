import { requireRole } from "@/lib/auth/dal";
import { AdminLeadsTrashPageClient } from "@/components/admin/leads/admin-leads-trash-page-client";

export default async function AdminLeadsTrashPage() {
  await requireRole(["ADMIN"]);
  return <AdminLeadsTrashPageClient />;
}
