"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function TeamLeadersPageClient() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<EmployeeListItem | null>(null);
  const [statusTarget, setStatusTarget] = React.useState<EmployeeListItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["employees", "TEAM_LEADER"],
    queryFn: () => fetchEmployees({ role: "TEAM_LEADER" }),
  });

  const statusMutation = useMutation({
    mutationFn: (leader: EmployeeListItem) =>
      leader.isActive ? deactivateEmployee(leader.id) : reactivateEmployee(leader.id),
    onSuccess: () => {
      toast.success(t.common.success);
      queryClient.invalidateQueries({ queryKey: ["employees", "TEAM_LEADER"] });
      setStatusTarget(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">{t.teamLeaders.title}</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          {t.teamLeaders.create}
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.employees.fullName}</TableHead>
              <TableHead>{t.employees.username}</TableHead>
              <TableHead>{t.teamLeaders.roster}</TableHead>
              <TableHead>{t.employees.activeStatus}</TableHead>
              <TableHead className="w-10" />
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
            {data?.items.map((leader) => (
              <TableRow key={leader.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/team-leaders/${leader.id}`} className="hover:underline">
                    {leader.fullName}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{leader.username}</TableCell>
                <TableCell>{leader._count?.employees ?? 0}</TableCell>
                <TableCell>
                  <Badge variant={leader.isActive ? "default" : "secondary"}>
                    {leader.isActive ? t.employees.active : t.employees.inactive}
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
                      <DropdownMenuItem onClick={() => setEditTarget(leader)}>
                        {t.common.edit}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusTarget(leader)}>
                        {leader.isActive ? t.employees.deactivate : t.employees.reactivate}
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
        role="TEAM_LEADER"
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      {editTarget && (
        <EmployeeFormDialog
          role="TEAM_LEADER"
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
