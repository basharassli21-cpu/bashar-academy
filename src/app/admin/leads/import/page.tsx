import { requireRole } from "@/lib/auth/dal";
import { LeadImportPageClient } from "@/components/admin/leads/lead-import-page-client";

export default async function LeadImportPage() {
  await requireRole(["ADMIN"]);
  return <LeadImportPageClient />;
}
