"use client";

import { toast } from "sonner";
import { Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/components/providers/locale-provider";

export function BackupCodesDialog({
  codes,
  onOpenChange,
}: {
  codes: string[] | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations();

  return (
    <Dialog open={!!codes} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.security.backupCodesTitle}</DialogTitle>
          <DialogDescription>{t.security.backupCodesDesc}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 rounded-md border bg-muted p-3 font-mono text-sm">
          {codes?.map((code) => <div key={code}>{code}</div>)}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              await navigator.clipboard.writeText((codes ?? []).join("\n"));
              toast.success(t.security.codesCopied);
            }}
          >
            <Copy />
            {t.security.copyCodes}
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            {t.security.backupCodesSavedConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
