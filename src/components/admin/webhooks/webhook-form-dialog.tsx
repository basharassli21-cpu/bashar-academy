"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  createWebhook,
  updateWebhook,
  WEBHOOK_EVENT_VALUES,
  type WebhookEventValue,
  type WebhookListItem,
} from "@/lib/api/webhooks";

export function WebhookFormDialog({
  mode,
  webhook,
  open,
  onOpenChange,
  onCreated,
}: {
  mode: "create" | "edit";
  webhook?: WebhookListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (secret: string) => void;
}) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [url, setUrl] = React.useState(webhook?.url ?? "");
  const [event, setEvent] = React.useState<WebhookEventValue>(
    webhook?.event ?? "LEAD_CREATED"
  );

  const eventLabels: Record<WebhookEventValue, string> = {
    LEAD_CREATED: t.webhooks.eventLeadCreated,
    LEAD_CLOSED_SALE: t.webhooks.eventLeadClosedSale,
    LEAD_ASSIGNED: t.webhooks.eventLeadAssigned,
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === "create") {
        return createWebhook({ url, event });
      }
      return updateWebhook(webhook!.id, { url, event });
    },
    onSuccess: (result) => {
      toast.success(mode === "create" ? t.webhooks.createdSuccess : t.webhooks.updatedSuccess);
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      onOpenChange(false);
      if (mode === "create") {
        setUrl("");
        setEvent("LEAD_CREATED");
        onCreated?.((result as WebhookListItem & { secret: string }).secret);
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? t.webhooks.createTitle : t.webhooks.editTitle}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="webhook-url">{t.webhooks.url}</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder={t.webhooks.urlPlaceholder}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="webhook-event">{t.webhooks.event}</Label>
            <Select
              items={WEBHOOK_EVENT_VALUES.map((value) => ({ value, label: eventLabels[value] }))}
              value={event}
              onValueChange={(value) => setEvent((value as WebhookEventValue) ?? "LEAD_CREATED")}
            >
              <SelectTrigger id="webhook-event" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEBHOOK_EVENT_VALUES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {eventLabels[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
