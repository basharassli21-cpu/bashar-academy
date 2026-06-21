import { requireRole } from "@/lib/auth/dal";
import { SalesDashboardClient } from "@/components/sales/dashboard/sales-dashboard-client";

export default async function SalesDashboardPage() {
  await requireRole(["SALES_EMPLOYEE"]);
  return <SalesDashboardClient />;
}
