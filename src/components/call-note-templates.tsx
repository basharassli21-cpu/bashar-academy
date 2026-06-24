"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "@/components/providers/locale-provider";
import { CALL_NOTE_TEMPLATES_BY_STATUS } from "@/lib/call-note-templates";
import type { LeadStatus } from "@/lib/api/leads";

export function CallNoteTemplates({
  status,
  onInsert,
}: {
  status: LeadStatus;
  onInsert: (text: string) => void;
}) {
  const t = useTranslations();
  const keys = CALL_NOTE_TEMPLATES_BY_STATUS[status];
  if (keys.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{t.leads.quickRepliesLabel}</span>
      {keys.map((key) => (
        <Button
          key={key}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onInsert(t.callNoteTemplates[key])}
        >
          {t.callNoteTemplates[key]}
        </Button>
      ))}
    </div>
  );
}
