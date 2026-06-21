import { requireRole } from "@/lib/auth/dal";
import { AdminLeadDetailClient } from "@/components/admin/leads/admin-lead-detail-client";

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { id } = await params;
  return <AdminLeadDetailClient leadId={id} />;
}
