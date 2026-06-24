"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/pagination-controls";
import { useTranslations } from "@/components/providers/locale-provider";
import { fetchErrorLog } from "@/lib/api/error-log";

export function AdminErrorLogPageClient() {
  const t = useTranslations();
  const [page, setPage] = React.useState(1);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["error-log", page],
    queryFn: () => fetchErrorLog({ page }),
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">{t.errorLog.title}</h1>
        <p className="text-sm text-muted-foreground">{t.errorLog.description}</p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.errorLog.columnTime}</TableHead>
              <TableHead>{t.errorLog.columnMessage}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  {t.errorLog.empty}
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((entry) => (
              <React.Fragment key={entry.id}>
                <TableRow>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">{entry.message}</TableCell>
                  <TableCell>
                    {entry.stack && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                      >
                        {expandedId === entry.id ? t.errorLog.hideStack : t.errorLog.showStack}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                {expandedId === entry.id && entry.stack && (
                  <TableRow>
                    <TableCell colSpan={3} className="bg-muted/30">
                      <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-muted-foreground">
                        {entry.stack}
                      </pre>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
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
