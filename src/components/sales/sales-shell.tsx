"use client";

import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, Contact, Inbox, ListChecks, ShieldCheck } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar, type NavGroup } from "@/components/app-sidebar";
import { NotificationBell } from "@/components/notification-bell";
import { CommandPalette } from "@/components/command-palette";
import { useTranslations } from "@/components/providers/locale-provider";
import { fetchSalesDashboard } from "@/lib/api/dashboard";
import type { CurrentUser } from "@/lib/auth/dal";

export function SalesShell({
  user,
  children,
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const { data } = useQuery({
    queryKey: ["dashboard", "sales"],
    queryFn: fetchSalesDashboard,
  });

  const navGroups: NavGroup[] = [
    {
      items: [
        { href: "/sales", label: t.nav.dashboard, icon: LayoutDashboard },
        { href: "/sales/queue", label: t.nav.workQueue, icon: ListChecks },
        {
          href: "/sales/leads",
          label: t.nav.myLeads,
          icon: Contact,
          badgeCount: data?.dueToday.length,
        },
        { href: "/sales/openc", label: t.nav.openc, icon: Inbox },
      ],
    },
    {
      items: [{ href: "/sales/security", label: t.nav.security, icon: ShieldCheck }],
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar navGroups={navGroups} user={user} />
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <div className="ms-auto flex items-center gap-2">
            <CommandPalette navGroups={navGroups} />
            <NotificationBell
              notificationsMuted={user.notificationsMuted}
              notificationDigestMode={user.notificationDigestMode}
            />
          </div>
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
