"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "@/components/providers/locale-provider";
import { STATUS_CLASSES } from "@/components/lead-status-badge";
import { LEAD_STATUS_VALUES, type LeadStatus } from "@/lib/api/leads";

export function LeadQuickStatusSelect({
  status,
  onChange,
  disabled,
}: {
  status: LeadStatus;
  onChange: (status: LeadStatus) => void;
  disabled?: boolean;
}) {
  const t = useTranslations();
  return (
    // The row/card this sits in is usually clickable (opens the lead detail
    // sheet) — stop the click here so picking a status doesn't also navigate.
    <div onClick={(e) => e.stopPropagation()} className="inline-block">
      <Select
        items={LEAD_STATUS_VALUES.map((s) => ({ value: s, label: t.status[s] }))}
        value={status}
        onValueChange={(v) => {
          if (v && v !== status) onChange(v as LeadStatus);
        }}
      >
        <SelectTrigger
          size="sm"
          disabled={disabled}
          className={`border-transparent font-medium ${STATUS_CLASSES[status]}`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LEAD_STATUS_VALUES.map((s) => (
            <SelectItem key={s} value={s}>
              {t.status[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
