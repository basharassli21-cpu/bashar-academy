import { requireRole } from "@/lib/auth/dal";
import { AdminWebhooksPageClient } from "@/components/admin/webhooks/admin-webhooks-page-client";

export default async function AdminWebhooksPage() {
  await requireRole(["ADMIN"]);
  return <AdminWebhooksPageClient />;
}
