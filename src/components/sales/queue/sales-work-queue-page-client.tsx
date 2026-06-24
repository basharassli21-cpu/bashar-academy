"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import { LeadQuickStatusSelect } from "@/components/lead-quick-status-select";
import { LeadNextActionBadge } from "@/components/lead-next-action-badge";
import { LeadTagsBadges } from "@/components/lead-tags";
import { PhoneActions } from "@/components/phone-actions";
import { useTranslations } from "@/components/providers/locale-provider";
import { fetchSalesWorkQueue } from "@/lib/api/work-queue";
import { updateLeadSales, type LeadStatus } from "@/lib/api/leads";
import { SalesLeadDetailContent } from "@/components/sales/leads/sales-lead-detail-content";

export function SalesWorkQueuePageClient() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = React.useState<{ id: string; customerName: string } | null>(
    null
  );

  const { data, isLoading } = useQuery({
    queryKey: ["leads", "sales", "queue"],
    queryFn: fetchSalesWorkQueue,
  });

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["leads", "sales"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "sales"] });
  }

  const quickStatusMutation = useMutation({
    mutationFn: ({ id, status, nextFollowupDate }: { id: string; status: LeadStatus; nextFollowupDate: string | null }) =>
      updateLeadSales(id, { status, note: t.leads.quickStatusChangeNote, nextFollowupDate }),
    onSuccess: () => {
      toast.success(t.leads.quickStatusChangeSuccess);
      invalidateAll();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">{t.workQueue.title}</h1>
        <p className="text-sm text-muted-foreground">{t.workQueue.description}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.common.status}</TableHead>
              <TableHead>{t.common.name}</TableHead>
              <TableHead>{t.common.phone}</TableHead>
              <TableHead>{t.leads.lastContact}</TableHead>
              <TableHead>{t.leads.nextFollowup}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  {t.workQueue.empty}
                </TableCell>
              </TableRow>
            )}
            {items.map((lead) => (
              <TableRow
                key={lead.id}
                className="cursor-pointer"
                onClick={() => setSelectedLead({ id: lead.id, customerName: lead.customerName })}
              >
                <TableCell>
                  <LeadNextActionBadge lead={lead} />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col gap-1">
                    <span>{lead.customerName}</span>
                    <div className="flex flex-wrap items-center gap-1">
                      <LeadTagsBadges tags={lead.tags} />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <PhoneActions phone={lead.phone} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-muted-foreground">
                      {lead.nextFollowupDate
                        ? new Date(lead.nextFollowupDate).toLocaleDateString()
                        : "—"}
                    </span>
                    <LeadQuickStatusSelect
                      status={lead.status}
                      disabled={
                        quickStatusMutation.isPending && quickStatusMutation.variables?.id === lead.id
                      }
                      onChange={(status) =>
                        quickStatusMutation.mutate({
                          id: lead.id,
                          status,
                          nextFollowupDate: lead.nextFollowupDate,
                        })
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
