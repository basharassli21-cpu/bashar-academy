"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadStatusBadge } from "@/components/lead-status-badge";
import { FollowupSlaBadge } from "@/components/followup-sla-badge";
import { LeadTagsBadges } from "@/components/lead-tags";
import { PhoneActions } from "@/components/phone-actions";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  fetchSalesLeads,
  LEAD_STATUS_VALUES,
  type LeadListItem,
  type LeadStatus,
} from "@/lib/api/leads";

const COLUMN_PAGE_SIZE = 50;

function KanbanCard({
  lead,
  onSelect,
}: {
  lead: LeadListItem;
  onSelect: () => void;
}) {
  const t = useTranslations();
  return (
    <Card size="sm" className="cursor-pointer hover:ring-foreground/20" onClick={onSelect}>
      <CardContent className="flex flex-col gap-1.5">
        <span className="font-medium">{lead.customerName}</span>
        <PhoneActions phone={lead.phone} />
        <LeadTagsBadges tags={lead.tags} />
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
  onSelectLead,
}: {
  status: LeadStatus;
  q: string;
  onSelectLead: (lead: LeadListItem) => void;
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
          <KanbanCard key={lead.id} lead={lead} onSelect={() => onSelectLead(lead)} />
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
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {LEAD_STATUS_VALUES.map((status) => (
        <KanbanColumn key={status} status={status} q={q} onSelectLead={onSelectLead} />
      ))}
    </div>
  );
}
