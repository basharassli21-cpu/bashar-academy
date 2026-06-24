"use client";

import { Lightbulb } from "lucide-react";
import { useTranslations } from "@/components/providers/locale-provider";
import { getNextAction, type NextActionInput } from "@/lib/lead-next-action";

export function LeadNextActionBanner({ lead }: { lead: NextActionInput }) {
  const t = useTranslations();
  const action = getNextAction(lead);
  if (!action) return null;

  return (
    <div className="flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
      <p className="text-sm">{t.leadNextAction.messages[action]}</p>
    </div>
  );
}
