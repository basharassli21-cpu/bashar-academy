import { requireRole } from "@/lib/auth/dal";
import { AdminSettingsPageClient } from "@/components/admin/settings/admin-settings-page-client";

export default async function AdminSettingsPage() {
  await requireRole(["ADMIN"]);
  return <AdminSettingsPageClient />;
}
