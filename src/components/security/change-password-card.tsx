"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/components/providers/locale-provider";
import { changePassword } from "@/lib/api/auth";

export function ChangePasswordCard() {
  const t = useTranslations();
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");

  const mutation = useMutation({
    mutationFn: () => changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      toast.success(t.security.passwordChangedSuccess);
    },
    onError: (error: Error) =>
      toast.error(error.message === "auth.invalidCredentials" ? t.auth.invalidCredentials : error.message),
  });

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <KeyRound className="mt-0.5 size-5 text-muted-foreground" />
        <div>
          <span className="font-medium">{t.security.changePasswordTitle}</span>
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="flex max-w-sm flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="current-password">{t.security.currentPasswordLabel}</Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="new-password">{t.security.newPasswordLabel}</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={mutation.isPending} className="self-start">
          {t.security.changePasswordButton}
        </Button>
      </form>
    </div>
  );
}
