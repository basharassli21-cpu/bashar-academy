"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadStatusBadge } from "@/components/lead-status-badge";
import { PaginationControls } from "@/components/pagination-controls";
import { useTranslations } from "@/components/providers/locale-provider";
import { fetchSalesLeads, LEAD_STATUS_VALUES, type LeadStatus } from "@/lib/api/leads";

const ALL_STATUSES = "ALL";

export function SalesLeadsPageClient() {
  const t = useTranslations();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<LeadStatus | typeof ALL_STATUSES>(ALL_STATUSES);
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["leads", "sales", q, status, page],
    queryFn: () =>
      fetchSalesLeads({ q, status: status === ALL_STATUSES ? "" : status, page }),
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{t.nav.myLeads}</h1>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder={t.leads.searchPlaceholder}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <Select
          items={[
            { value: ALL_STATUSES, label: t.leads.statusFilterAll },
            ...LEAD_STATUS_VALUES.map((s) => ({ value: s, label: t.status[s] })),
          ]}
          value={status}
          onValueChange={(v) => {
            setStatus((v as LeadStatus | typeof ALL_STATUSES) ?? ALL_STATUSES);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUSES}>{t.leads.statusFilterAll}</SelectItem>
            {LEAD_STATUS_VALUES.map((s) => (
              <SelectItem key={s} value={s}>
                {t.status[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.leads.customerName}</TableHead>
              <TableHead>{t.common.phone}</TableHead>
              <TableHead>{t.common.status}</TableHead>
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
            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  {t.common.noResults}
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">
                  <Link href={`/sales/leads/${lead.id}`} className="hover:underline">
                    {lead.customerName}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground" dir="ltr">
                  {lead.phone}
                </TableCell>
                <TableCell>
                  <LeadStatusBadge status={lead.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {lead.nextFollowupDate ? new Date(lead.nextFollowupDate).toLocaleDateString() : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data && (
        <PaginationControls page={data.page} pageCount={data.pageCount} onPageChange={setPage} />
      )}
    </div>
  );
}
