"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { PhoneActions } from "@/components/phone-actions";
import { PaginationControls } from "@/components/pagination-controls";
import { useTranslations } from "@/components/providers/locale-provider";
import { fetchAdminOpenC } from "@/lib/api/leads";

export function AdminOpenCPageClient() {
  const t = useTranslations();
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [bucket, setBucket] = React.useState<"open_sea" | "fresh">("open_sea");

  const { data, isLoading } = useQuery({
    queryKey: ["leads", "admin", "openc", q, page, bucket],
    queryFn: () => fetchAdminOpenC({ q, page, bucket }),
    refetchInterval: 30000,
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{t.openc.title}</h1>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={bucket === "open_sea" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setBucket("open_sea");
            setPage(1);
          }}
        >
          {t.openc.openSeaTab}
        </Button>
        <Button
          type="button"
          variant={bucket === "fresh" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setBucket("fresh");
            setPage(1);
          }}
        >
          {t.openc.freshTab}
        </Button>
      </div>

      <Input
        placeholder={t.openc.searchPlaceholder}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setPage(1);
        }}
        className="max-w-sm"
      />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.leads.customerName}</TableHead>
              <TableHead>{t.common.phone}</TableHead>
              <TableHead>{t.common.status}</TableHead>
              <TableHead>{t.openc.pulledAt}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {t.openc.empty}
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/leads/${lead.id}`} className="hover:underline">
                    {lead.customerName}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <PhoneActions phone={lead.phone} />
                </TableCell>
                <TableCell>
                  <LeadStatusBadge status={lead.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {lead.pulledToOpenAt ? new Date(lead.pulledToOpenAt).toLocaleString() : "—"}
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
