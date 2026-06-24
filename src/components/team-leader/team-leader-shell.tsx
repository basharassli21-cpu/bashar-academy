"use client";

import { Users, ShieldCheck } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar, type NavGroup } from "@/components/app-sidebar";
import { NotificationBell } from "@/components/notification-bell";
import { CommandPalette } from "@/components/command-palette";
import { useTranslations } from "@/components/providers/locale-provider";
import type { CurrentUser } from "@/lib/auth/dal";

export function TeamLeaderShell({
  user,
  children,
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  const t = useTranslations();

  const navGroups: NavGroup[] = [
    {
      items: [{ href: "/team-leader", label: t.nav.employees, icon: Users }],
    },
    {
      items: [{ href: "/team-leader/security", label: t.nav.security, icon: ShieldCheck }],
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
