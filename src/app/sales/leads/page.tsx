import { requireRole } from "@/lib/auth/dal";
import { SalesLeadsPageClient } from "@/components/sales/leads/sales-leads-page-client";

export default async function SalesLeadsPage() {
  await requireRole(["SALES_EMPLOYEE"]);
  return <SalesLeadsPageClient />;
}
