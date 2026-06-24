"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { LeadStatusBadge } from "@/components/lead-status-badge";
import { PaginationControls } from "@/components/pagination-controls";
import { useTranslations } from "@/components/providers/locale-provider";
import { fetchLeadsTrash, restoreLead, deleteLead } from "@/lib/api/leads";

export function AdminLeadsTrashPageClient() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [purgeId, setPurgeId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["leads", "admin", "trash", page],
    queryFn: () => fetchLeadsTrash({ page }),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["leads", "admin", "trash"] });
    queryClient.invalidateQueries({ queryKey: ["leads", "admin"] });
  }

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreLead(id),
    onSuccess: () => {
      toast.success(t.leadsTrash.restoreSuccess);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const purgeMutation = useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      toast.success(t.leadsTrash.permanentDeleteSuccess);
      setPurgeId(null);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">{t.leadsTrash.title}</h1>
        <p className="text-sm text-muted-foreground">{t.leadsTrash.description}</p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.leads.customerName}</TableHead>
              <TableHead>{t.common.phone}</TableHead>
              <TableHead>{t.common.status}</TableHead>
              <TableHead>{t.leadsTrash.columnDeletedAt}</TableHead>
              <TableHead>{t.leadsTrash.columnDeletedBy}</TableHead>
              <TableHead>{t.common.actions}</TableHead>
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
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {t.leadsTrash.empty}
                </TableCell>
              </TableRow>
            )}
            {items.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.customerName}</TableCell>
                <TableCell className="text-muted-foreground" dir="ltr">
                  {lead.phone}
                </TableCell>
                <TableCell>
                  <LeadStatusBadge status={lead.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(lead.deletedAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {lead.deletedBy?.fullName ?? "—"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={restoreMutation.isPending}
                      onClick={() => restoreMutation.mutate(lead.id)}
                    >
                      {t.leadsTrash.restoreButton}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setPurgeId(lead.id)}>
                      {t.leadsTrash.permanentDeleteButton}
                    </Button>
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

      <AlertDialog open={purgeId !== null} onOpenChange={(open) => !open && setPurgeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.leadsTrash.permanentDeleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.leadsTrash.permanentDeleteConfirmDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => purgeId && purgeMutation.mutate(purgeId)}>
              {t.common.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
