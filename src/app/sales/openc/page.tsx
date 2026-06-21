import { requireRole } from "@/lib/auth/dal";
import { SalesOpenCPageClient } from "@/components/sales/openc/sales-openc-page-client";

export default async function SalesOpenCPage() {
  await requireRole(["SALES_EMPLOYEE"]);
  return <SalesOpenCPageClient />;
}
