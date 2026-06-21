import { requireRole } from "@/lib/auth/dal";
import { AdminDashboardClient } from "@/components/admin/dashboard/admin-dashboard-client";

export default async function AdminDashboardPage() {
  await requireRole(["ADMIN"]);
  return <AdminDashboardClient />;
}
