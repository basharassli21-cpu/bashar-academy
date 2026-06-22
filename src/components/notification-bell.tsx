"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
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
    return <>{String(data.employeeName ?? "")} {t.notifications.teamAssignment}</>;
  }

  return null;
}

export function NotificationBell() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

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

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: invalidate,
  });

  const items = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
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
              onClick={() => {
                if (!item.isRead) markReadMutation.mutate(item.id);
              }}
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
  );
}
