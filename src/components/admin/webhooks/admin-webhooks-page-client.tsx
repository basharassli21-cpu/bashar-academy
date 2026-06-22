"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useTranslations } from "@/components/providers/locale-provider";
import {
  fetchWebhooks,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  type WebhookListItem,
  type WebhookEventValue,
} from "@/lib/api/webhooks";
import { WebhookFormDialog } from "@/components/admin/webhooks/webhook-form-dialog";
import { WebhookSecretDialog } from "@/components/admin/webhooks/webhook-secret-dialog";

export function AdminWebhooksPageClient() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<WebhookListItem | null>(null);
  const [statusTarget, setStatusTarget] = React.useState<WebhookListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<WebhookListItem | null>(null);
  const [revealedSecret, setRevealedSecret] = React.useState<string | null>(null);

  const eventLabels: Record<WebhookEventValue, string> = {
    LEAD_CREATED: t.webhooks.eventLeadCreated,
    LEAD_CLOSED_SALE: t.webhooks.eventLeadClosedSale,
    LEAD_ASSIGNED: t.webhooks.eventLeadAssigned,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["webhooks"],
    queryFn: fetchWebhooks,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["webhooks"] });
  }

  const statusMutation = useMutation({
    mutationFn: (webhook: WebhookListItem) =>
      updateWebhook(webhook.id, { isActive: !webhook.isActive }),
    onSuccess: () => {
      toast.success(t.common.success);
      invalidate();
      setStatusTarget(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWebhook(id),
    onSuccess: () => {
      toast.success(t.webhooks.deletedSuccess);
      invalidate();
      setDeleteTarget(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const testMutation = useMutation({
    mutationFn: (id: string) => testWebhook(id),
    onSuccess: ({ status }) => {
      if (status === "success") {
        toast.success(t.webhooks.testPingResultSuccess);
      } else {
        toast.error(`${t.webhooks.testPingResultFailure} ${status}`);
      }
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">{t.webhooks.title}</h1>
          <p className="text-sm text-muted-foreground">{t.webhooks.description}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          {t.webhooks.create}
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.webhooks.url}</TableHead>
              <TableHead>{t.webhooks.event}</TableHead>
              <TableHead>{t.webhooks.status}</TableHead>
              <TableHead>{t.webhooks.lastTriggered}</TableHead>
              <TableHead>{t.webhooks.lastStatus}</TableHead>
              <TableHead className="w-10" />
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
                  {t.webhooks.emptyState}
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((webhook) => (
              <TableRow key={webhook.id}>
                <TableCell className="max-w-80 truncate font-mono text-sm">{webhook.url}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{eventLabels[webhook.event]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={webhook.isActive ? "default" : "secondary"}>
                    {webhook.isActive ? t.webhooks.active : t.webhooks.inactive}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {webhook.lastTriggeredAt
                    ? new Date(webhook.lastTriggeredAt).toLocaleString()
                    : t.webhooks.never}
                </TableCell>
                <TableCell className="max-w-48 truncate text-muted-foreground">
                  {webhook.lastStatus ?? "—"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditTarget(webhook)}>
                        {t.common.edit}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => testMutation.mutate(webhook.id)}
                      >
                        {t.webhooks.sendTestPing}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusTarget(webhook)}>
                        {webhook.isActive ? t.webhooks.deactivate : t.webhooks.reactivate}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteTarget(webhook)}>
                        {t.common.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <WebhookFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={setRevealedSecret}
      />

      {editTarget && (
        <WebhookFormDialog
          mode="edit"
          webhook={editTarget}
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
        />
      )}

      <WebhookSecretDialog
        secret={revealedSecret}
        onOpenChange={(open) => !open && setRevealedSecret(null)}
      />

      <AlertDialog open={!!statusTarget} onOpenChange={(open) => !open && setStatusTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusTarget?.isActive
                ? t.webhooks.deactivateConfirmTitle
                : t.webhooks.reactivateConfirmTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusTarget?.isActive
                ? t.webhooks.deactivateConfirmDesc
                : t.webhooks.reactivateConfirmDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => statusTarget && statusMutation.mutate(statusTarget)}>
              {t.common.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.webhooks.deleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.webhooks.deleteConfirmDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
