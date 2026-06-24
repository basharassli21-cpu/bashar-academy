"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadStatusBadge } from "@/components/lead-status-badge";
import { LeadQuickStatusSelect } from "@/components/lead-quick-status-select";
import { FollowupSlaBadge } from "@/components/followup-sla-badge";
import { LeadScoreBadge } from "@/components/lead-score-badge";
import { LeadTagsBadges } from "@/components/lead-tags";
import { PhoneActions } from "@/components/phone-actions";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  fetchSalesLeads,
  updateLeadSales,
  LEAD_STATUS_VALUES,
  type LeadListItem,
  type LeadStatus,
} from "@/lib/api/leads";

const COLUMN_PAGE_SIZE = 50;

function KanbanCard({
  lead,
  pending,
  onSelect,
  onQuickStatusChange,
}: {
  lead: LeadListItem;
  pending: boolean;
  onSelect: () => void;
  onQuickStatusChange: (status: LeadStatus) => void;
}) {
  const t = useTranslations();
  return (
    <Card size="sm" className="cursor-pointer hover:ring-foreground/20" onClick={onSelect}>
      <CardContent className="flex flex-col gap-1.5">
        <span className="font-medium">{lead.customerName}</span>
        <PhoneActions phone={lead.phone} />
        <LeadQuickStatusSelect status={lead.status} disabled={pending} onChange={onQuickStatusChange} />
        <div className="flex flex-wrap items-center gap-1">
          <LeadScoreBadge lead={lead} />
          <LeadTagsBadges tags={lead.tags} />
        </div>
        <span className="truncate text-xs text-muted-foreground">{lead.latestNote || "—"}</span>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {t.leads.nextFollowup}:{" "}
            {lead.nextFollowupDate ? new Date(lead.nextFollowupDate).toLocaleDateString() : "—"}
          </span>
          <FollowupSlaBadge nextFollowupDate={lead.nextFollowupDate} status={lead.status} />
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanColumn({
  status,
  q,
  pendingLeadId,
  onSelectLead,
  onQuickStatusChange,
}: {
  status: LeadStatus;
  q: string;
  pendingLeadId: string | null;
  onSelectLead: (lead: LeadListItem) => void;
  onQuickStatusChange: (lead: LeadListItem, status: LeadStatus) => void;
}) {
  const t = useTranslations();
  const { data, isLoading } = useQuery({
    queryKey: ["leads", "sales", "kanban", status, q],
    queryFn: () =>
      fetchSalesLeads({
        q,
        status,
        pageSize: COLUMN_PAGE_SIZE,
        sortBy: "nextFollowupDate",
        sortDir: "asc",
      }),
  });

  const items = data?.items ?? [];
  const hiddenCount = data ? Math.max(0, data.total - items.length) : 0;

  return (
    <div className="flex w-72 shrink-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-2 px-1">
        <LeadStatusBadge status={status} />
        <Badge variant="secondary">{data?.total ?? 0}</Badge>
      </div>
      <div className="flex flex-col gap-2">
        {isLoading && <Skeleton className="h-20 w-full" />}
        {!isLoading && items.length === 0 && (
          <p className="px-1 text-sm text-muted-foreground">{t.common.noResults}</p>
        )}
        {items.map((lead) => (
          <KanbanCard
            key={lead.id}
            lead={lead}
            pending={pendingLeadId === lead.id}
            onSelect={() => onSelectLead(lead)}
            onQuickStatusChange={(newStatus) => onQuickStatusChange(lead, newStatus)}
          />
        ))}
        {hiddenCount > 0 && (
          <p className="px-1 text-xs text-muted-foreground">
            +{hiddenCount} {t.leads.moreInStatus}
          </p>
        )}
      </div>
    </div>
  );
}

export function SalesLeadsKanban({
  q,
  onSelectLead,
}: {
  q: string;
  onSelectLead: (lead: LeadListItem) => void;
}) {
  const t = useTranslations();
  const queryClient = useQueryClient();

  const quickStatusMutation = useMutation({
    mutationFn: ({ lead, status }: { lead: LeadListItem; status: LeadStatus }) =>
      updateLeadSales(lead.id, {
        status,
        note: t.leads.quickStatusChangeNote,
        nextFollowupDate: lead.nextFollowupDate,
      }),
    onSuccess: () => {
      toast.success(t.leads.quickStatusChangeSuccess);
      queryClient.invalidateQueries({ queryKey: ["leads", "sales"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const pendingLeadId = quickStatusMutation.isPending ? quickStatusMutation.variables?.lead.id ?? null : null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {LEAD_STATUS_VALUES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          q={q}
          pendingLeadId={pendingLeadId}
          onSelectLead={onSelectLead}
          onQuickStatusChange={(lead, newStatus) => quickStatusMutation.mutate({ lead, status: newStatus })}
        />
      ))}
    </div>
  );
}
