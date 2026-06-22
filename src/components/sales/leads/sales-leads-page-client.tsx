"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LeadStatusBadge } from "@/components/lead-status-badge";
import { FollowupSlaBadge } from "@/components/followup-sla-badge";
import { LeadTagsBadges } from "@/components/lead-tags";
import { PhoneActions } from "@/components/phone-actions";
import { PaginationControls } from "@/components/pagination-controls";
import { FilterPresetsBar } from "@/components/filter-presets-bar";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  fetchSalesLeads,
  LEAD_STATUS_VALUES,
  type LeadListItem,
  type LeadStatus,
  type LeadSortField,
  type SortDir,
} from "@/lib/api/leads";
import { SalesLeadDetailContent } from "@/components/sales/leads/sales-lead-detail-content";
import { SalesLeadsKanban } from "@/components/sales/leads/sales-leads-kanban";

const ALL_STATUSES = "ALL";
type ViewMode = "table" | "kanban";

type SalesLeadsFilterPreset = {
  q: string;
  status: LeadStatus | typeof ALL_STATUSES;
  sortBy: LeadSortField | null;
  sortDir: SortDir;
};

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="size-3.5 text-muted-foreground/50" />;
  return dir === "asc" ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />;
}

function SortableHead({
  field,
  sortBy,
  sortDir,
  onToggle,
  children,
}: {
  field: LeadSortField;
  sortBy: LeadSortField | null;
  sortDir: SortDir;
  onToggle: (field: LeadSortField) => void;
  children: React.ReactNode;
}) {
  return (
    <TableHead>
      <button
        type="button"
        onClick={() => onToggle(field)}
        className="flex items-center gap-1 hover:text-foreground"
      >
        {children}
        <SortIcon active={sortBy === field} dir={sortDir} />
      </button>
    </TableHead>
  );
}

export function SalesLeadsPageClient() {
  const t = useTranslations();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<LeadStatus | typeof ALL_STATUSES>(ALL_STATUSES);
  const [page, setPage] = React.useState(1);
  const [sortBy, setSortBy] = React.useState<LeadSortField | null>(null);
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");
  const [selectedLead, setSelectedLead] = React.useState<{ id: string; customerName: string } | null>(
    null
  );
  const [view, setView] = React.useState<ViewMode>("table");

  const { data, isLoading } = useQuery({
    queryKey: ["leads", "sales", q, status, page, sortBy, sortDir],
    queryFn: () =>
      fetchSalesLeads({
        q,
        status: status === ALL_STATUSES ? "" : status,
        page,
        ...(sortBy ? { sortBy, sortDir } : {}),
      }),
  });

  function toggleSort(field: LeadSortField) {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{t.nav.myLeads}</h1>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder={t.leads.searchPlaceholder}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
        {view === "table" && (
          <Select
            items={[
              { value: ALL_STATUSES, label: t.leads.statusFilterAll },
              ...LEAD_STATUS_VALUES.map((s) => ({ value: s, label: t.status[s] })),
            ]}
            value={status}
            onValueChange={(v) => {
              setStatus((v as LeadStatus | typeof ALL_STATUSES) ?? ALL_STATUSES);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUSES}>{t.leads.statusFilterAll}</SelectItem>
              {LEAD_STATUS_VALUES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t.status[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="ms-auto flex items-center gap-2">
          <Button
            type="button"
            variant={view === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("table")}
          >
            {t.leads.tableView}
          </Button>
          <Button
            type="button"
            variant={view === "kanban" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("kanban")}
          >
            {t.leads.kanbanView}
          </Button>
        </div>
      </div>

      <FilterPresetsBar<SalesLeadsFilterPreset>
        storageKey="sales-leads-filter-presets"
        currentFilters={{ q, status, sortBy, sortDir }}
        onApply={(preset) => {
          setQ(preset.q);
          setStatus(preset.status);
          setSortBy(preset.sortBy);
          setSortDir(preset.sortDir);
          setPage(1);
        }}
      />

      {view === "table" && (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead field="customerName" sortBy={sortBy} sortDir={sortDir} onToggle={toggleSort}>
                    {t.common.name}
                  </SortableHead>
                  <TableHead>{t.common.phone}</TableHead>
                  <SortableHead field="status" sortBy={sortBy} sortDir={sortDir} onToggle={toggleSort}>
                    {t.common.status}
                  </SortableHead>
                  <TableHead>{t.common.note}</TableHead>
                  <SortableHead field="lastContactDate" sortBy={sortBy} sortDir={sortDir} onToggle={toggleSort}>
                    {t.leads.lastContact}
                  </SortableHead>
                  <SortableHead field="nextFollowupDate" sortBy={sortBy} sortDir={sortDir} onToggle={toggleSort}>
                    {t.leads.nextFollowup}
                  </SortableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && data?.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      {t.common.noResults}
                    </TableCell>
                  </TableRow>
                )}
                {data?.items.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedLead({ id: lead.id, customerName: lead.customerName })}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-1">
                        <span>{lead.customerName}</span>
                        <LeadTagsBadges tags={lead.tags} />
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <PhoneActions phone={lead.phone} />
                    </TableCell>
                    <TableCell>
                      <LeadStatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell className="max-w-48 truncate text-muted-foreground">
                      {lead.latestNote || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span>
                          {lead.nextFollowupDate
                            ? new Date(lead.nextFollowupDate).toLocaleDateString()
                            : "—"}
                        </span>
                        <FollowupSlaBadge
                          nextFollowupDate={lead.nextFollowupDate}
                          status={lead.status}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {data && (
            <PaginationControls page={data.page} pageCount={data.pageCount} onPageChange={setPage} />
          )}
        </>
      )}

      {view === "kanban" && (
        <SalesLeadsKanban
          q={q}
          onSelectLead={(lead: LeadListItem) =>
            setSelectedLead({ id: lead.id, customerName: lead.customerName })
          }
        />
      )}

      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedLead?.customerName}</SheetTitle>
          </SheetHeader>
          {selectedLead && (
            <div className="px-4 pb-4">
              <SalesLeadDetailContent leadId={selectedLead.id} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
