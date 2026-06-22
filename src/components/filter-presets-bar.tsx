"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useTranslations } from "@/components/providers/locale-provider";
import { useFilterPresets } from "@/hooks/use-filter-presets";

export function FilterPresetsBar<T>({
  storageKey,
  currentFilters,
  onApply,
}: {
  storageKey: string;
  currentFilters: T;
  onApply: (filters: T) => void;
}) {
  const t = useTranslations();
  const { presets, savePreset, deletePreset } = useFilterPresets<T>(storageKey);
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    savePreset(trimmed, currentFilters);
    setName("");
    setOpen(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {presets.map((preset) => (
        <Badge
          key={preset.id}
          variant="secondary"
          className="cursor-pointer gap-1"
          onClick={() => onApply(preset.filters)}
        >
          {preset.name}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deletePreset(preset.id);
            }}
            className="rounded-full hover:bg-foreground/10"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button type="button" variant="outline" size="sm">
              <Plus className="size-3.5" />
              {t.leads.savePreset}
            </Button>
          }
        />
        <PopoverContent className="w-72 p-3">
          <form onSubmit={handleSave} className="flex flex-col gap-2">
            <Label htmlFor="presetName">{t.leads.presetNameLabel}</Label>
            <Input
              id="presetName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.leads.presetNamePlaceholder}
              autoFocus
            />
            <Button type="submit" size="sm">
              {t.common.save}
            </Button>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}
