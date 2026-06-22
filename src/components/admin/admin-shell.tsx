"use client";

import {
  LayoutDashboard,
  Users,
  Crown,
  Contact,
  Upload,
  Shuffle,
  Inbox,
  ScrollText,
  Webhook,
  ShieldCheck,
} from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar, type NavGroup } from "@/components/app-sidebar";
import { NotificationBell } from "@/components/notification-bell";
import { useTranslations } from "@/components/providers/locale-provider";
import type { CurrentUser } from "@/lib/auth/dal";

export function AdminShell({
  user,
  children,
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  const t = useTranslations();

  const navGroups: NavGroup[] = [
    {
      items: [{ href: "/admin", label: t.nav.dashboard, icon: LayoutDashboard }],
    },
    {
      label: t.nav.employees,
      items: [
        { href: "/admin/employees", label: t.nav.employees, icon: Users },
        { href: "/admin/team-leaders", label: t.nav.teamLeaders, icon: Crown },
      ],
    },
    {
      label: t.nav.leads,
      items: [
        { href: "/admin/leads", label: t.nav.leads, icon: Contact },
        { href: "/admin/leads/import", label: t.nav.importLeads, icon: Upload },
        { href: "/admin/leads/distribute", label: t.nav.distribute, icon: Shuffle },
        { href: "/admin/openc", label: t.nav.openc, icon: Inbox },
      ],
    },
    {
      label: t.nav.settings,
      items: [
        { href: "/admin/webhooks", label: t.nav.webhooks, icon: Webhook },
        { href: "/admin/security", label: t.nav.security, icon: ShieldCheck },
      ],
    },
    {
      items: [{ href: "/admin/audit-log", label: t.nav.auditLog, icon: ScrollText }],
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar navGroups={navGroups} user={user} />
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <div className="ms-auto">
            <NotificationBell />
          </div>
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
