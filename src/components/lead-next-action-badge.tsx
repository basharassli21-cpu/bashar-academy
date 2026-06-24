"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useTranslations } from "@/components/providers/locale-provider";
import { getNextAction, type NextActionCode, type NextActionInput } from "@/lib/lead-next-action";

const ACTION_CLASSES: Record<NextActionCode, string> = {
  CALL_OVERDUE_FOLLOWUP:
    "border-transparent bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  CALL_DUE_TODAY:
    "border-transparent bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  CALL_FIRST_CONTACT:
    "border-transparent bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  SCHEDULE_FOLLOWUP:
    "border-transparent bg-purple-500/10 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
  RE_ENGAGE_STALE:
    "border-transparent bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
  WAIT_FOLLOWUP_SCHEDULED:
    "border-transparent bg-gray-500/10 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400",
};

export function LeadNextActionBadge({ lead }: { lead: NextActionInput }) {
  const t = useTranslations();
  const action = getNextAction(lead);
  if (!action) return null;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Badge variant="outline" className={ACTION_CLASSES[action]}>
            {t.leadNextAction.shortLabels[action]}
          </Badge>
        }
      />
      <TooltipContent>{t.leadNextAction.messages[action]}</TooltipContent>
    </Tooltip>
  );
}
