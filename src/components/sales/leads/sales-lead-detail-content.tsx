"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadStatusBadge } from "@/components/lead-status-badge";
import { FollowupSlaBadge } from "@/components/followup-sla-badge";
import { LeadTagsEditor } from "@/components/lead-tags";
import { PhoneActions } from "@/components/phone-actions";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  fetchSalesLead,
  updateLeadSales,
  updateSalesLeadTags,
  LEAD_STATUS_VALUES,
  type LeadStatus,
} from "@/lib/api/leads";

export function SalesLeadDetailContent({ leadId }: { leadId: string }) {
  const t = useTranslations();
  const queryClient = useQueryClient();

  const { data: lead, isLoading } = useQuery({
    queryKey: ["leads", "sales", "detail", leadId],
    queryFn: () => fetchSalesLead(leadId),
  });

  const [status, setStatus] = React.useState<LeadStatus>("NEW");
  const [note, setNote] = React.useState("");
  const [nextFollowupDate, setNextFollowupDate] = React.useState("");

  // Re-initialize the editable fields whenever a different lead's data
  // arrives, without an Effect (https://react.dev/learn/you-might-not-need-an-effect).
  const [syncedLead, setSyncedLead] = React.useState(lead);
  if (lead && lead !== syncedLead) {
    setSyncedLead(lead);
    setStatus(lead.status);
    setNextFollowupDate(lead.nextFollowupDate ? lead.nextFollowupDate.slice(0, 10) : "");
  }

  const updateMutation = useMutation({
    mutationFn: () =>
      updateLeadSales(leadId, { status, note, nextFollowupDate: nextFollowupDate || null }),
    onSuccess: () => {
      toast.success(t.leads.updateSuccess);
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["leads", "sales", "detail", leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads", "sales"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const tagsMutation = useMutation({
    mutationFn: (tags: string[]) => updateSalesLeadTags(leadId, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", "sales", "detail", leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads", "sales"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading || !lead) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">{t.common.phone}</p>
          <PhoneActions phone={lead.phone} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t.common.status}</p>
          <LeadStatusBadge status={lead.status} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t.leads.lastContact}</p>
          <p>{lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString() : "—"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t.leads.nextFollowup}</p>
          <div className="flex items-center gap-1.5">
            <p>
              {lead.nextFollowupDate ? new Date(lead.nextFollowupDate).toLocaleDateString() : "—"}
            </p>
            <FollowupSlaBadge nextFollowupDate={lead.nextFollowupDate} status={lead.status} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <p className="mb-2 text-sm text-muted-foreground">{t.leads.tags}</p>
        <LeadTagsEditor tags={lead.tags ?? []} onChange={(tags) => tagsMutation.mutate(tags)} />
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="mb-4 font-semibold">{t.leads.updateTitle}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate();
          }}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>{t.common.status}</Label>
              <Select
                items={LEAD_STATUS_VALUES.map((s) => ({ value: s, label: t.status[s] }))}
                value={status}
                onValueChange={(v) => setStatus((v as LeadStatus) ?? status)}
              >
                <SelectTrigger>
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
            <div className="flex flex-col gap-2">
              <Label htmlFor="nextFollowupDate">{t.leads.nextFollowup}</Label>
              <Input
                id="nextFollowupDate"
                type="date"
                value={nextFollowupDate}
                onChange={(e) => setNextFollowupDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="callNote">{t.leads.logCallNote}</Label>
            <Textarea
              id="callNote"
              required
              placeholder={t.leads.notePlaceholder}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={updateMutation.isPending} className="self-start">
            {t.leads.saveUpdate}
          </Button>
        </form>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="mb-4 font-semibold">{t.leads.callHistory}</h2>
        {lead.notes.length === 0 && (
          <p className="text-sm text-muted-foreground">{t.leads.noNotesYet}</p>
        )}
        <div className="flex flex-col gap-3">
          {lead.notes.map((n) => (
            <div key={n.id} className="border-b pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{n.employee.fullName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="mt-1">
                <LeadStatusBadge status={n.statusAtTime} />
              </div>
              <p className="mt-1 text-sm">{n.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
