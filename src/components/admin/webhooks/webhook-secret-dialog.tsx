"use client";

import * as React from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
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
import { useTranslations } from "@/components/providers/locale-provider";

export function WebhookSecretDialog({
  secret,
  onOpenChange,
}: {
  secret: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations();
  const [copied, setCopied] = React.useState(false);

  return (
    <Dialog open={!!secret} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.webhooks.secretRevealTitle}</DialogTitle>
          <DialogDescription>{t.webhooks.secretRevealDesc}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t.webhooks.secretLabel}</span>
          <div className="flex items-center gap-2">
            <Input readOnly value={secret ?? ""} className="font-mono text-xs" />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={async () => {
                await navigator.clipboard.writeText(secret ?? "");
                setCopied(true);
                toast.success(t.webhooks.copiedToClipboard);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? <Check /> : <Copy />}
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            {t.common.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
