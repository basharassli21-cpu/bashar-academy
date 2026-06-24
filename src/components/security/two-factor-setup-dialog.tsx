"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/components/providers/locale-provider";
import { confirmTwoFactor } from "@/lib/api/security";

export function TwoFactorSetupDialog({
  data,
  onOpenChange,
  onEnabled,
}: {
  data: { secret: string; otpauthUri: string; qrCodeDataUrl: string } | null;
  onOpenChange: (open: boolean) => void;
  onEnabled: (backupCodes: string[]) => void;
}) {
  const t = useTranslations();
  const [code, setCode] = React.useState("");

  const confirmMutation = useMutation({
    mutationFn: () => confirmTwoFactor(code),
    onSuccess: ({ backupCodes }) => {
      setCode("");
      onEnabled(backupCodes);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog open={!!data} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.security.setupTitle}</DialogTitle>
          <DialogDescription>{t.security.setupScanInstruction}</DialogDescription>
        </DialogHeader>
        {data && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              confirmMutation.mutate();
            }}
            className="flex flex-col gap-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.qrCodeDataUrl}
              alt="QR code"
              className="size-48 self-center rounded-md border p-2"
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{t.security.setupManualEntry}</span>
              <code className="rounded-md bg-muted px-2 py-1.5 font-mono text-xs break-all">
                {data.secret}
              </code>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="totp-code">{t.security.setupCodeLabel}</Label>
              <Input
                id="totp-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={code.length !== 6 || confirmMutation.isPending}>
                {t.security.confirmAndEnable}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
