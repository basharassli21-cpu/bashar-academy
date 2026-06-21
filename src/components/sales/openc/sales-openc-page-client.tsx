"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { fetchSalesOpenC, claimOpenCLead } from "@/lib/api/leads";

export function SalesOpenCPageClient() {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [claimingId, setClaimingId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["leads", "sales", "openc", q, page],
    queryFn: () => fetchSalesOpenC({ q, page }),
  });

  const claimMutation = useMutation({
    mutationFn: (id: string) => claimOpenCLead(id),
    onSuccess: (_data, id) => {
      toast.success(t.openc.claimSuccess);
      queryClient.invalidateQueries({ queryKey: ["leads", "sales", "openc"] });
      queryClient.invalidateQueries({ queryKey: ["leads", "sales"] });
      router.push(`/sales/leads/${id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message === "openc.alreadyClaimed" ? t.openc.alreadyClaimed : error.message);
      queryClient.invalidateQueries({ queryKey: ["leads", "sales", "openc"] });
    },
    onSettled: () => setClaimingId(null),
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{t.openc.title}</h1>

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
              <TableHead>{t.common.status}</TableHead>
              <TableHead>{t.openc.pulledAt}</TableHead>
              <TableHead className="w-10" />
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
                <TableCell className="font-medium">{lead.customerName}</TableCell>
                <TableCell>
                  <LeadStatusBadge status={lead.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {lead.pulledToOpenAt ? new Date(lead.pulledToOpenAt).toLocaleString() : "—"}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    disabled={claimMutation.isPending && claimingId === lead.id}
                    onClick={() => {
                      setClaimingId(lead.id);
                      claimMutation.mutate(lead.id);
                    }}
                  >
                    {t.openc.claim}
                  </Button>
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
