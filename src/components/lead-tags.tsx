"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/components/providers/locale-provider";

export function LeadTagsBadges({ tags }: { tags?: string[] | null }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs">
          {tag}
        </Badge>
      ))}
    </div>
  );
}

export function LeadTagsEditor({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const t = useTranslations();
  const [draft, setDraft] = React.useState("");

  function addTag() {
    const value = draft.trim();
    setDraft("");
    if (!value || tags.includes(value)) return;
    onChange([...tags, value]);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 text-xs">
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((existing) => existing !== tag))}
              className="rounded-full hover:bg-foreground/10"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag();
          }
        }}
        onBlur={addTag}
        placeholder={t.leads.addTagPlaceholder}
        className="h-8 max-w-56 text-sm"
      />
    </div>
  );
}
