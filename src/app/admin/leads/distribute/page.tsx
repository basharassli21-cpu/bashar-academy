import { requireRole } from "@/lib/auth/dal";
import { DistributePageClient } from "@/components/admin/leads/distribute-page-client";

export default async function DistributePage() {
  await requireRole(["ADMIN"]);
  return <DistributePageClient />;
}
