"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Download } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadQuickStatusSelect } from "@/components/lead-quick-status-select";
import { FollowupSlaBadge } from "@/components/followup-sla-badge";
import { LeadScoreBadge } from "@/components/lead-score-badge";
import { LeadTagsBadges } from "@/components/lead-tags";
import { PhoneActions } from "@/components/phone-actions";
import { PaginationControls } from "@/components/pagination-controls";
import { FilterPresetsBar } from "@/components/filter-presets-bar";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  fetchAdminLeads,
  bulkTransferLeads,
  bulkDeleteLeads,
  buildLeadsExportUrl,
  updateLeadAdmin,
  LEAD_STATUS_VALUES,
  type LeadStatus,
} from "@/lib/api/leads";
import { fetchEmployees } from "@/lib/api/employees";
import { LeadCreateDialog } from "@/components/admin/leads/lead-create-dialog";

const ALL_STATUSES = "ALL";

type AdminLeadsFilterPreset = {
  q: string;
  status: LeadStatus | typeof ALL_STATUSES;
};

export function AdminLeadsPageClient() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<LeadStatus | typeof ALL_STATUSES>(ALL_STATUSES);
  const [page, setPage] = React.useState(1);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [bulkTransferOpen, setBulkTransferOpen] = React.useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [bulkTransferTo, setBulkTransferTo] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["leads", "admin", q, status, page],
    queryFn: () =>
      fetchAdminLeads({ q, status: status === ALL_STATUSES ? "" : status, page }),
  });

  const employeesQuery = useQuery({
    queryKey: ["employees", "SALES_EMPLOYEE", "active"],
    queryFn: () => fetchEmployees({ role: "SALES_EMPLOYEE", isActive: true }),
    enabled: bulkTransferOpen,
  });

  function clearSelection() {
    setSelectedIds([]);
  }

  function invalidateLeads() {
    queryClient.invalidateQueries({ queryKey: ["leads", "admin"] });
  }

  const bulkTransferMutation = useMutation({
    mutationFn: () => bulkTransferLeads(selectedIds, bulkTransferTo),
    onSuccess: () => {
      toast.success(t.leads.bulkTransferSuccess);
      setBulkTransferOpen(false);
      setBulkTransferTo("");
      clearSelection();
      invalidateLeads();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: () => bulkDeleteLeads(selectedIds),
    onSuccess: () => {
      toast.success(t.leads.bulkDeleteSuccess);
      setBulkDeleteOpen(false);
      clearSelection();
      invalidateLeads();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const quickStatusMutation = useMutation({
    mutationFn: ({ id, status, nextFollowupDate }: { id: string; status: LeadStatus; nextFollowupDate: string | null }) =>
      updateLeadAdmin(id, { status, note: t.leads.quickStatusChangeNote, nextFollowupDate }),
    onSuccess: () => {
      toast.success(t.leads.quickStatusChangeSuccess);
      invalidateLeads();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const items = data?.items ?? [];
  const allOnPageSelected = items.length > 0 && items.every((lead) => selectedIds.includes(lead.id));

  function toggleAllOnPage(checked: boolean) {
    setSelectedIds((prev) => {
      const pageIds = items.map((lead) => lead.id);
      if (checked) {
        return [...new Set([...prev, ...pageIds])];
      }
      return prev.filter((id) => !pageIds.includes(id));
    });
  }

  function toggleOne(id: string, checked: boolean) {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">{t.leads.title}</h1>
        <div className="flex items-center gap-2">
          <a
            href={buildLeadsExportUrl({ q, status: status === ALL_STATUSES ? "" : status })}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <Download />
            {t.leads.exportCsv}
          </a>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            {t.leads.create}
          </Button>
        </div>
      </div>

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
      </div>

      <FilterPresetsBar<AdminLeadsFilterPreset>
        storageKey="admin-leads-filter-presets"
        currentFilters={{ q, status }}
        onApply={(preset) => {
          setQ(preset.q);
          setStatus(preset.status);
          setPage(1);
        }}
      />

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2">
          <span className="text-sm font-medium">
            {selectedIds.length} {t.leads.selectedCount}
          </span>
          <Button variant="outline" size="sm" onClick={() => setBulkTransferOpen(true)}>
            {t.leads.bulkTransfer}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
            {t.leads.bulkDelete}
          </Button>
          <Button variant="ghost" size="sm" className="ms-auto" onClick={clearSelection}>
            {t.leads.clearSelection}
          </Button>
        </div>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allOnPageSelected}
                  onCheckedChange={(checked) => toggleAllOnPage(checked === true)}
                />
              </TableHead>
              <TableHead>{t.leads.customerName}</TableHead>
              <TableHead>{t.common.phone}</TableHead>
              <TableHead>{t.common.status}</TableHead>
              <TableHead>{t.leads.owner}</TableHead>
              <TableHead>{t.leads.lastContact}</TableHead>
              <TableHead>{t.leads.nextFollowup}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {t.common.noResults}
                </TableCell>
              </TableRow>
            )}
            {items.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(lead.id)}
                    onCheckedChange={(checked) => toggleOne(lead.id, checked === true)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col gap-1">
                    <Link href={`/admin/leads/${lead.id}`} className="hover:underline">
                      {lead.customerName}
                    </Link>
                    <div className="flex flex-wrap items-center gap-1">
                      <LeadScoreBadge lead={lead} />
                      <LeadTagsBadges tags={lead.tags} />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <PhoneActions phone={lead.phone} />
                </TableCell>
                <TableCell>
                  <LeadQuickStatusSelect
                    status={lead.status}
                    disabled={quickStatusMutation.isPending && quickStatusMutation.variables?.id === lead.id}
                    onChange={(status) =>
                      quickStatusMutation.mutate({
                        id: lead.id,
                        status,
                        nextFollowupDate: lead.nextFollowupDate,
                      })
                    }
                  />
                </TableCell>
                <TableCell>{lead.owner?.fullName ?? t.leads.unowned}</TableCell>
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
                    <FollowupSlaBadge nextFollowupDate={lead.nextFollowupDate} status={lead.status} />
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

      <LeadCreateDialog open={createOpen} onOpenChange={setCreateOpen} />

      <Dialog open={bulkTransferOpen} onOpenChange={setBulkTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.leads.bulkTransferTitle}</DialogTitle>
          </DialogHeader>
          <Select
            items={(employeesQuery.data?.items ?? []).map((employee) => ({
              value: employee.id,
              label: employee.fullName,
            }))}
            value={bulkTransferTo}
            onValueChange={(v) => setBulkTransferTo(v ?? "")}
          >
            <SelectTrigger>
              <SelectValue placeholder={t.teamLeaders.selectEmployee} />
            </SelectTrigger>
            <SelectContent>
              {employeesQuery.data?.items.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              disabled={!bulkTransferTo || bulkTransferMutation.isPending}
              onClick={() => bulkTransferMutation.mutate()}
            >
              {t.leads.bulkTransfer}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.leads.bulkDeleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.leads.bulkDeleteConfirmDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => bulkDeleteMutation.mutate()}>
              {t.common.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
