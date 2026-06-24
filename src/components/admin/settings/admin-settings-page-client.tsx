"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/components/providers/locale-provider";
import { fetchSettings, updateSettings } from "@/lib/api/settings";

export function AdminSettingsPageClient() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [defaultCountryCode, setDefaultCountryCode] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const syncedValue = data?.defaultCountryCode;
  const [synced, setSynced] = React.useState(syncedValue);
  if (syncedValue !== undefined && syncedValue !== synced) {
    setSynced(syncedValue);
    setDefaultCountryCode(syncedValue);
  }

  const mutation = useMutation({
    mutationFn: () => updateSettings({ defaultCountryCode }),
    onSuccess: (updated) => {
      toast.success(t.settings.savedSuccess);
      queryClient.setQueryData(["settings"], updated);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">{t.settings.title}</h1>
        <p className="text-sm text-muted-foreground">{t.settings.description}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="flex flex-col gap-4 rounded-lg border p-4 max-w-sm"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="defaultCountryCode">{t.settings.defaultCountryCodeLabel}</Label>
          <Input
            id="defaultCountryCode"
            value={defaultCountryCode}
            onChange={(e) => setDefaultCountryCode(e.target.value)}
            disabled={isLoading}
            required
          />
          <p className="text-sm text-muted-foreground">{t.settings.defaultCountryCodeHint}</p>
        </div>
        <Button type="submit" disabled={isLoading || mutation.isPending} className="self-start">
          {t.common.save}
        </Button>
      </form>
    </div>
  );
}
