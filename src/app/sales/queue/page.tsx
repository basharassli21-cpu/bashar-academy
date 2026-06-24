import { requireRole } from "@/lib/auth/dal";
import { SalesWorkQueuePageClient } from "@/components/sales/queue/sales-work-queue-page-client";

export default async function SalesWorkQueuePage() {
  await requireRole(["SALES_EMPLOYEE"]);
  return <SalesWorkQueuePageClient />;
}
