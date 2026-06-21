"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  createEmployee,
  updateEmployee,
  type EmployeeListItem,
} from "@/lib/api/employees";

type FormValues = {
  username: string;
  password: string;
  fullName: string;
  monthlyTarget?: string;
};

function getSchema(mode: "create" | "edit") {
  return z.object({
    username:
      mode === "create"
        ? z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,20}$/)
        : z.string(),
    password: mode === "create" ? z.string().min(6) : z.string().min(6).or(z.literal("")),
    fullName: z.string().trim().min(1),
    monthlyTarget: z.string().optional(),
  });
}

export function EmployeeFormDialog({
  role,
  mode,
  employee,
  open,
  onOpenChange,
}: {
  role: "SALES_EMPLOYEE" | "TEAM_LEADER";
  mode: "create" | "edit";
  employee?: EmployeeListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(getSchema(mode)),
    values:
      mode === "edit" && employee
        ? {
            username: employee.username,
            password: "",
            fullName: employee.fullName,
            monthlyTarget: employee.monthlyTarget ? String(employee.monthlyTarget) : "",
          }
        : undefined,
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const monthlyTarget = values.monthlyTarget ? Number(values.monthlyTarget) : null;
      if (mode === "create") {
        return createEmployee({
          username: values.username,
          password: values.password,
          fullName: values.fullName,
          role,
          monthlyTarget: role === "SALES_EMPLOYEE" ? monthlyTarget : null,
        });
      }
      return updateEmployee(employee!.id, {
        fullName: values.fullName,
        monthlyTarget: role === "SALES_EMPLOYEE" ? monthlyTarget : null,
        newPassword: values.password || undefined,
      });
    },
    onSuccess: () => {
      toast.success(mode === "create" ? t.employees.createdSuccess : t.employees.updatedSuccess);
      queryClient.invalidateQueries({ queryKey: ["employees", role] });
      onOpenChange(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error(error.message === "employees.usernameTaken" ? t.employees.usernameTaken : error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? t.employees.createTitle : t.employees.editTitle}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="fullName">{t.employees.fullName}</Label>
            <Input id="fullName" {...register("fullName")} />
            {errors.fullName && <p className="text-sm text-destructive">{t.common.required}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">{t.employees.username}</Label>
            <Input id="username" disabled={mode === "edit"} {...register("username")} />
            {errors.username && (
              <p className="text-sm text-destructive">3-20 chars: a-z, 0-9, _</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">
              {mode === "create" ? t.auth.password : t.employees.newPasswordOptional}
            </Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{t.common.required} (6+)</p>}
          </div>
          {role === "SALES_EMPLOYEE" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="monthlyTarget">{t.employees.monthlyTarget}</Label>
              <Input id="monthlyTarget" type="number" min={1} {...register("monthlyTarget")} />
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
