import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/components/providers/locale-provider";
import type { LeadStatus } from "@/lib/api/leads";

export const STATUS_CLASSES: Record<LeadStatus, string> = {
  NEW: "border-transparent bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  CONTACTED:
    "border-transparent bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
  INTERESTED:
    "border-transparent bg-green-500/10 text-green-600 dark:bg-green-500/15 dark:text-green-400",
  NOT_INTERESTED: "border-transparent bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  CLOSED_SALE:
    "border-transparent bg-emerald-700/10 text-emerald-800 dark:bg-emerald-700/20 dark:text-emerald-400",
  CANCELLED: "border-transparent bg-gray-500/10 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const t = useTranslations();
  return (
    <Badge variant="outline" className={STATUS_CLASSES[status]}>
      {t.status[status]}
    </Badge>
  );
}
