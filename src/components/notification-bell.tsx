"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  markNotificationTypeRead,
  updateNotificationPreferences,
  type NotificationItem,
} from "@/lib/api/notifications";
import { cn } from "@/lib/utils";

function NotificationMessage({ notification }: { notification: NotificationItem }) {
  const t = useTranslations();
  const data = notification.data ?? {};

  if (notification.type === "LEAD_ASSIGNED") {
    const count = typeof data.count === "number" ? data.count : 1;
    if (count > 1) return <>{count} {t.notifications.leadAssignedMany}</>;
    return <>{t.notifications.leadAssignedOne} {String(data.customerName ?? "")}</>;
  }

  if (notification.type === "TEAM_ASSIGNMENT") {
    const count = typeof data.count === "number" ? data.count : 1;
    if (count > 1) return <>{count} {t.notifications.teamAssignmentMany}</>;
    return <>{String(data.employeeName ?? "")} {t.notifications.teamAssignment}</>;
  }

  return null;
}

export function NotificationBell({
  notificationsMuted,
  notificationDigestMode,
}: {
  notificationsMuted: boolean;
  notificationDigestMode: boolean;
}) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [preferencesOpen, setPreferencesOpen] = React.useState(false);
  const [muted, setMuted] = React.useState(notificationsMuted);
  const [digest, setDigest] = React.useState(notificationDigestMode);

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 30000,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: invalidate,
  });

  const markTypeReadMutation = useMutation({
    mutationFn: markNotificationTypeRead,
    onSuccess: invalidate,
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: invalidate,
  });

  const preferencesMutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: invalidate,
  });

  const items = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  function handleItemClick(item: NotificationItem) {
    if (item.isRead) return;
    if (item.id.startsWith("digest:")) {
      markTypeReadMutation.mutate(item.type);
    } else {
      markReadMutation.mutate(item.id);
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button variant="ghost" size="icon" className="relative" aria-label={t.notifications.title}>
              <Bell />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -end-1 h-4 min-w-4 justify-center px-1 text-[10px]"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>
          }
        />
        <PopoverContent>
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-sm font-medium">{t.notifications.title}</span>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                >
                  {t.notifications.markAllRead}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label={t.notifications.preferencesButtonLabel}
                onClick={() => setPreferencesOpen(true)}
              >
                <Settings className="size-4" />
              </Button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                {t.notifications.empty}
              </p>
            )}
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                className={cn(
                  "flex w-full flex-col gap-0.5 border-b px-3 py-2 text-start text-sm last:border-b-0 hover:bg-muted/50",
                  !item.isRead && "bg-accent/40"
                )}
              >
                <span className={cn(!item.isRead && "font-medium")}>
                  <NotificationMessage notification={item} />
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.notifications.preferencesTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2">
              <Checkbox
                id="notif-mute"
                checked={muted}
                onCheckedChange={(checked) => setMuted(checked === true)}
              />
              <div className="flex flex-col gap-1">
                <Label htmlFor="notif-mute">{t.notifications.muteLabel}</Label>
                <p className="text-xs text-muted-foreground">{t.notifications.muteHint}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="notif-digest"
                checked={digest}
                onCheckedChange={(checked) => setDigest(checked === true)}
              />
              <div className="flex flex-col gap-1">
                <Label htmlFor="notif-digest">{t.notifications.digestLabel}</Label>
                <p className="text-xs text-muted-foreground">{t.notifications.digestHint}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={preferencesMutation.isPending}
              onClick={() =>
                preferencesMutation.mutate(
                  { notificationsMuted: muted, notificationDigestMode: digest },
                  { onSuccess: () => setPreferencesOpen(false) }
                )
              }
            >
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
