import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/components/providers/locale-provider";
import { getFollowupSla } from "@/lib/leads-sla";
import type { LeadStatus } from "@/lib/api/leads";

const SLA_CLASSES = {
  overdue: "border-transparent bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  due_today:
    "border-transparent bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
} as const;

export function FollowupSlaBadge({
  nextFollowupDate,
  status,
}: {
  nextFollowupDate: string | null | undefined;
  status: LeadStatus;
}) {
  const t = useTranslations();
  const sla = getFollowupSla(nextFollowupDate, status);
  if (!sla) return null;

  return (
    <Badge variant="outline" className={SLA_CLASSES[sla]}>
      {sla === "overdue" ? t.common.overdue : t.common.dueToday}
    </Badge>
  );
}
