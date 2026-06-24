"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/components/providers/locale-provider";
import { fetchAdminLeads } from "@/lib/api/leads";
import type { NavGroup, NavItem } from "@/components/app-sidebar";

type ResultItem = {
  key: string;
  label: string;
  sublabel?: string;
  icon?: NavItem["icon"];
  href: string;
};

export function CommandPalette({
  navGroups,
  enableLeadSearch = false,
}: {
  navGroups: NavGroup[];
  enableLeadSearch?: boolean;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 200);
    return () => clearTimeout(id);
  }, [query, open]);

  const navItems: NavItem[] = React.useMemo(
    () => navGroups.flatMap((group) => group.items),
    [navGroups]
  );

  const matchedNavItems = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return navItems;
    return navItems.filter((item) => item.label.toLowerCase().includes(q));
  }, [navItems, query]);

  const leadsQuery = useQuery({
    queryKey: ["command-palette", "leads", debouncedQuery],
    queryFn: () => fetchAdminLeads({ q: debouncedQuery, page: 1 }),
    enabled: enableLeadSearch && open && debouncedQuery.length > 0,
  });

  const navResults: ResultItem[] = matchedNavItems.map((item) => ({
    key: `nav-${item.href}`,
    label: item.label,
    icon: item.icon,
    href: item.href,
  }));

  const leadResults: ResultItem[] =
    enableLeadSearch && debouncedQuery.length > 0
      ? (leadsQuery.data?.items ?? []).map((lead) => ({
          key: `lead-${lead.id}`,
          label: lead.customerName,
          sublabel: lead.phone,
          href: `/admin/leads/${lead.id}`,
        }))
      : [];

  const allResults = [...navResults, ...leadResults];

  // Reset the highlighted row whenever the result set changes shape, without
  // a separate Effect (https://react.dev/learn/you-might-not-need-an-effect).
  const resultsKey = `${query}:${leadResults.length}`;
  const [syncedResultsKey, setSyncedResultsKey] = React.useState(resultsKey);
  if (resultsKey !== syncedResultsKey) {
    setSyncedResultsKey(resultsKey);
    setHighlightedIndex(0);
  }

  function closeAndReset() {
    setOpen(false);
    setQuery("");
    setDebouncedQuery("");
    setHighlightedIndex(0);
  }

  function activate(item: ResultItem) {
    router.push(item.href);
    closeAndReset();
  }

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = allResults[highlightedIndex];
      if (item) activate(item);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="size-3.5" />
        {t.commandPalette.openButtonLabel}
        <kbd className="ms-2 hidden rounded border bg-muted px-1 font-mono text-[0.7rem] sm:inline">
          ⌘K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : closeAndReset())}>
        <DialogContent
          showCloseButton={false}
          className="top-24 max-w-lg -translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg"
        >
          <div className="border-b p-2">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={t.commandPalette.placeholder}
              className="border-none shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {navResults.length > 0 && (
              <div className="mb-2">
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                  {t.commandPalette.navigationGroup}
                </p>
                {navResults.map((item) => {
                  const index = allResults.indexOf(item);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => activate(item)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm ${
                        index === highlightedIndex ? "bg-accent text-accent-foreground" : ""
                      }`}
                    >
                      {Icon && <Icon className="size-4 text-muted-foreground" />}
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}

            {enableLeadSearch && debouncedQuery.length > 0 && (
              <div>
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                  {t.commandPalette.leadsGroup}
                </p>
                {leadResults.map((item) => {
                  const index = allResults.indexOf(item);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => activate(item)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-start text-sm ${
                        index === highlightedIndex ? "bg-accent text-accent-foreground" : ""
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.sublabel && (
                        <span className="text-xs text-muted-foreground" dir="ltr">
                          {item.sublabel}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {allResults.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                {t.commandPalette.noResults}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
