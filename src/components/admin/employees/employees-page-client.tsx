"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  fetchEmployees,
  deactivateEmployee,
  reactivateEmployee,
  type EmployeeListItem,
} from "@/lib/api/employees";
import { EmployeeFormDialog } from "@/components/admin/employees/employee-form-dialog";

export function EmployeesPageClient() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [q, setQ] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<EmployeeListItem | null>(null);
  const [statusTarget, setStatusTarget] = React.useState<EmployeeListItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["employees", "SALES_EMPLOYEE", q],
    queryFn: () => fetchEmployees({ role: "SALES_EMPLOYEE", q }),
  });

  const statusMutation = useMutation({
    mutationFn: (employee: EmployeeListItem) =>
      employee.isActive ? deactivateEmployee(employee.id) : reactivateEmployee(employee.id),
    onSuccess: () => {
      toast.success(t.common.success);
      queryClient.invalidateQueries({ queryKey: ["employees", "SALES_EMPLOYEE"] });
      setStatusTarget(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">{t.employees.title}</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          {t.employees.create}
        </Button>
      </div>

      <Input
        placeholder={t.employees.searchPlaceholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.employees.fullName}</TableHead>
              <TableHead>{t.employees.username}</TableHead>
              <TableHead>{t.employees.monthlyTarget}</TableHead>
              <TableHead>{t.employees.teamLeader}</TableHead>
              <TableHead>{t.employees.activeStatus}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {t.common.noResults}
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/employees/${employee.id}`} className="hover:underline">
                    {employee.fullName}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{employee.username}</TableCell>
                <TableCell>{employee.monthlyTarget ?? "—"}</TableCell>
                <TableCell>{employee.teamLeader?.fullName ?? t.employees.noTeamLeader}</TableCell>
                <TableCell>
                  <Badge variant={employee.isActive ? "default" : "secondary"}>
                    {employee.isActive ? t.employees.active : t.employees.inactive}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditTarget(employee)}>
                        {t.common.edit}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusTarget(employee)}>
                        {employee.isActive ? t.employees.deactivate : t.employees.reactivate}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EmployeeFormDialog
        role="SALES_EMPLOYEE"
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      {editTarget && (
        <EmployeeFormDialog
          role="SALES_EMPLOYEE"
          mode="edit"
          employee={editTarget}
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
        />
      )}

      <AlertDialog open={!!statusTarget} onOpenChange={(open) => !open && setStatusTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusTarget?.isActive
                ? t.employees.deactivateConfirmTitle
                : t.employees.reactivateConfirmTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusTarget?.isActive
                ? t.employees.deactivateConfirmDesc
                : t.employees.reactivateConfirmDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => statusTarget && statusMutation.mutate(statusTarget)}>
              {t.common.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
