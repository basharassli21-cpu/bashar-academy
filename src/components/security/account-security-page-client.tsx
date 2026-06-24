"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/components/providers/locale-provider";
import { setupTwoFactor } from "@/lib/api/security";
import { TwoFactorSetupDialog } from "@/components/security/two-factor-setup-dialog";
import { BackupCodesDialog } from "@/components/security/backup-codes-dialog";
import { DisableTwoFactorDialog } from "@/components/security/disable-two-factor-dialog";
import { ChangePasswordCard } from "@/components/security/change-password-card";

export function AccountSecurityPageClient({ initialTotpEnabled }: { initialTotpEnabled: boolean }) {
  const t = useTranslations();
  const [totpEnabled, setTotpEnabled] = React.useState(initialTotpEnabled);
  const [enrollData, setEnrollData] = React.useState<{
    secret: string;
    otpauthUri: string;
    qrCodeDataUrl: string;
  } | null>(null);
  const [revealedBackupCodes, setRevealedBackupCodes] = React.useState<string[] | null>(null);
  const [disableOpen, setDisableOpen] = React.useState(false);

  const setupMutation = useMutation({
    mutationFn: setupTwoFactor,
    onSuccess: (data) => setEnrollData(data),
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">{t.security.title}</h1>
        <p className="text-sm text-muted-foreground">{t.security.description}</p>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {totpEnabled ? (
              <ShieldCheck className="mt-0.5 size-5 text-emerald-600 dark:text-emerald-500" />
            ) : (
              <ShieldOff className="mt-0.5 size-5 text-muted-foreground" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{t.security.twoFactorTitle}</span>
                <Badge variant={totpEnabled ? "default" : "secondary"}>
                  {totpEnabled ? t.security.enabled : t.security.disabled}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{t.security.twoFactorDescription}</p>
            </div>
          </div>
          {totpEnabled ? (
            <Button variant="outline" onClick={() => setDisableOpen(true)}>
              {t.security.disable}
            </Button>
          ) : (
            <Button onClick={() => setupMutation.mutate()} disabled={setupMutation.isPending}>
              {t.security.enable}
            </Button>
          )}
        </div>
      </div>

      <ChangePasswordCard />

      <TwoFactorSetupDialog
        data={enrollData}
        onOpenChange={(open) => !open && setEnrollData(null)}
        onEnabled={(backupCodes) => {
          setEnrollData(null);
          setTotpEnabled(true);
          toast.success(t.security.enabledSuccess);
          setRevealedBackupCodes(backupCodes);
        }}
      />

      <BackupCodesDialog
        codes={revealedBackupCodes}
        onOpenChange={(open) => !open && setRevealedBackupCodes(null)}
      />

      <DisableTwoFactorDialog
        open={disableOpen}
        onOpenChange={setDisableOpen}
        onDisabled={() => {
          setDisableOpen(false);
          setTotpEnabled(false);
          toast.success(t.security.disabledSuccess);
        }}
      />
    </div>
  );
}
