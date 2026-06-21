"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  fetchEmployees,
  assignEmployeeToLeader,
  unassignEmployeeFromLeader,
} from "@/lib/api/employees";

export function TeamLeaderRoster({
  leaderId,
  leaderName,
}: {
  leaderId: string;
  leaderName: string;
}) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string>("");

  const rosterQuery = useQuery({
    queryKey: ["employees", "SALES_EMPLOYEE", "roster", leaderId],
    queryFn: () => fetchEmployees({ role: "SALES_EMPLOYEE", teamLeaderId: leaderId }),
  });

  const allEmployeesQuery = useQuery({
    queryKey: ["employees", "SALES_EMPLOYEE", "all"],
    queryFn: () => fetchEmployees({ role: "SALES_EMPLOYEE" }),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["employees", "SALES_EMPLOYEE"] });
  }

  const assignMutation = useMutation({
    mutationFn: (employeeId: string) => assignEmployeeToLeader(leaderId, employeeId),
    onSuccess: () => {
      toast.success(t.teamLeaders.assignedSuccess);
      setSelectedEmployeeId("");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const unassignMutation = useMutation({
    mutationFn: (employeeId: string) => unassignEmployeeFromLeader(leaderId, employeeId),
    onSuccess: () => {
      toast.success(t.common.success);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const assignableEmployees = (allEmployeesQuery.data?.items ?? []).filter(
    (e) => e.teamLeaderId !== leaderId
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{leaderName}</h1>

      <div className="flex items-center gap-2">
        <Select
          items={assignableEmployees.map((employee) => ({
            value: employee.id,
            label: employee.fullName,
          }))}
          value={selectedEmployeeId}
          onValueChange={(value) => setSelectedEmployeeId(value ?? "")}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder={t.teamLeaders.selectEmployee} />
          </SelectTrigger>
          <SelectContent>
            {assignableEmployees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          disabled={!selectedEmployeeId || assignMutation.isPending}
          onClick={() => assignMutation.mutate(selectedEmployeeId)}
        >
          {t.teamLeaders.assignEmployee}
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.employees.fullName}</TableHead>
              <TableHead>{t.employees.username}</TableHead>
              <TableHead>{t.employees.monthlyTarget}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rosterQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            )}
            {!rosterQuery.isLoading && rosterQuery.data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {t.teamLeaders.noEmployees}
                </TableCell>
              </TableRow>
            )}
            {rosterQuery.data?.items.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.fullName}</TableCell>
                <TableCell className="text-muted-foreground">{employee.username}</TableCell>
                <TableCell>{employee.monthlyTarget ?? "—"}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    title={t.teamLeaders.unassign}
                    onClick={() => unassignMutation.mutate(employee.id)}
                  >
                    <UserMinus />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
