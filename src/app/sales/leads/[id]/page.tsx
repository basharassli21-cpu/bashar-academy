import { requireRole } from "@/lib/auth/dal";
import { SalesLeadDetailClient } from "@/components/sales/leads/sales-lead-detail-client";

export default async function SalesLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["SALES_EMPLOYEE"]);
  const { id } = await params;
  return <SalesLeadDetailClient leadId={id} />;
}
