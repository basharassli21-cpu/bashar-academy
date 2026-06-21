"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "@/components/providers/locale-provider";
import { distributeLeads, fetchAdminOpenC } from "@/lib/api/leads";
import { fetchEmployees } from "@/lib/api/employees";

export function DistributePageClient() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [selectedEmployeeIds, setSelectedEmployeeIds] = React.useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const employeesQuery = useQuery({
    queryKey: ["employees", "SALES_EMPLOYEE", "all"],
    queryFn: () => fetchEmployees({ role: "SALES_EMPLOYEE" }),
  });

  const poolQuery = useQuery({
    queryKey: ["leads", "admin", "openc", "count"],
    queryFn: () => fetchAdminOpenC({ page: 1 }),
  });

  const distributeMutation = useMutation({
    mutationFn: () => distributeLeads(selectedEmployeeIds),
    onSuccess: (data) => {
      toast.success(`${data.distributedCount} ${t.distribute.successMessage}`);
      setConfirmOpen(false);
      setSelectedEmployeeIds([]);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{t.distribute.title}</h1>
      <p className="text-sm text-muted-foreground">{t.distribute.description}</p>

      <div className="flex flex-col gap-4 rounded-lg border p-4">
        <div>
          <p className="text-sm text-muted-foreground">{t.distribute.poolCount}</p>
          <p className="text-2xl font-semibold">{poolQuery.data?.total ?? "—"}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t.distribute.selectEmployees}</Label>
          <div className="flex flex-col gap-2">
            {employeesQuery.data?.items.map((employee) => (
              <label key={employee.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selectedEmployeeIds.includes(employee.id)}
                  onCheckedChange={(checked) =>
                    setSelectedEmployeeIds((prev) =>
                      checked ? [...prev, employee.id] : prev.filter((id) => id !== employee.id)
                    )
                  }
                />
                {employee.fullName}
              </label>
            ))}
          </div>
        </div>

        <Button
          disabled={selectedEmployeeIds.length === 0 || !poolQuery.data?.total}
          onClick={() => setConfirmOpen(true)}
          className="self-start"
        >
          {t.distribute.distributeButton}
        </Button>
        {poolQuery.data && poolQuery.data.total === 0 && (
          <p className="text-sm text-muted-foreground">{t.distribute.noLeadsInPool}</p>
        )}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.distribute.confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.distribute.confirmDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => distributeMutation.mutate()}>
              {t.common.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
