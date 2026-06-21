import { requireRole } from "@/lib/auth/dal";
import { AdminOpenCPageClient } from "@/components/admin/openc/admin-openc-page-client";

export default async function AdminOpenCPage() {
  await requireRole(["ADMIN"]);
  return <AdminOpenCPageClient />;
}
