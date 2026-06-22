"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "@/components/providers/locale-provider";
import { fetchSalesLead } from "@/lib/api/leads";
import { SalesLeadDetailContent } from "@/components/sales/leads/sales-lead-detail-content";

export function SalesLeadDetailClient({ leadId }: { leadId: string }) {
  const t = useTranslations();
  const { data: lead } = useQuery({
    queryKey: ["leads", "sales", "detail", leadId],
    queryFn: () => fetchSalesLead(leadId),
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link href="/sales/leads" className="text-sm text-muted-foreground hover:underline">
          {t.leads.backToList}
        </Link>
        <h1 className="text-xl font-semibold">{lead?.customerName}</h1>
      </div>
      <SalesLeadDetailContent leadId={leadId} />
    </div>
  );
}
