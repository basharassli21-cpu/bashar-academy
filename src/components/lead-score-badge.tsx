"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useTranslations } from "@/components/providers/locale-provider";
import { scoreLead, type LeadScoreBand, type LeadScoreInput } from "@/lib/lead-scoring";

const BAND_CLASSES: Record<LeadScoreBand, string> = {
  hot: "border-transparent bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  warm: "border-transparent bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  cold: "border-transparent bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
};

export function LeadScoreBadge({ lead }: { lead: LeadScoreInput }) {
  const t = useTranslations();
  const result = scoreLead(lead);
  if (!result) return null;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Badge variant="outline" className={BAND_CLASSES[result.band]}>
            {t.leadScore.bandLabels[result.band]} · {result.score}
          </Badge>
        }
      />
      <TooltipContent>
        <ul className="flex flex-col gap-0.5">
          {result.reasons.map((reason) => (
            <li key={reason}>{t.leadScore.reasonLabels[reason]}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
