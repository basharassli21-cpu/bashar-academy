"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/components/providers/locale-provider";
import { createLead } from "@/lib/api/leads";
import { fetchEmployees } from "@/lib/api/employees";

const NO_OWNER = "__NONE__";

export function LeadCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [customerName, setCustomerName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [ownerEmployeeId, setOwnerEmployeeId] = React.useState(NO_OWNER);

  const employeesQuery = useQuery({
    queryKey: ["employees", "SALES_EMPLOYEE", "active"],
    queryFn: () => fetchEmployees({ role: "SALES_EMPLOYEE", isActive: true }),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: () =>
      createLead({
        customerName,
        phone,
        ownerEmployeeId: ownerEmployeeId === NO_OWNER ? null : ownerEmployeeId,
      }),
    onSuccess: () => {
      toast.success(t.leads.createdSuccess);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setCustomerName("");
      setPhone("");
      setOwnerEmployeeId(NO_OWNER);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message === "leads.phoneTaken" ? t.leads.phoneTaken : error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.leads.createTitle}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="leadCustomerName">{t.leads.customerName}</Label>
            <Input
              id="leadCustomerName"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="leadPhone">{t.common.phone}</Label>
            <Input
              id="leadPhone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="leadOwner">{t.leads.owner}</Label>
            <Select
              items={[
                { value: NO_OWNER, label: t.leads.noOwnerOption },
                ...(employeesQuery.data?.items.map((employee) => ({
                  value: employee.id,
                  label: employee.fullName,
                })) ?? []),
              ]}
              value={ownerEmployeeId}
              onValueChange={(v) => setOwnerEmployeeId(v ?? NO_OWNER)}
            >
              <SelectTrigger id="leadOwner">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_OWNER}>{t.leads.noOwnerOption}</SelectItem>
                {employeesQuery.data?.items.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
