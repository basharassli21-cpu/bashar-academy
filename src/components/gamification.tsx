"use client";

import { Flame, Trophy, Target, Phone } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/components/providers/locale-provider";
import { getBadges, type BadgeCode } from "@/lib/gamification";

const BADGE_ICONS: Record<BadgeCode, typeof Trophy> = {
  TOP_PERFORMER: Trophy,
  TARGET_HIT: Target,
  POWER_CALLER: Phone,
};

const BADGE_CLASSES: Record<BadgeCode, string> = {
  TOP_PERFORMER:
    "border-transparent bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  TARGET_HIT:
    "border-transparent bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  POWER_CALLER:
    "border-transparent bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
};

export function GamificationBadges({
  rank,
  salesThisMonth,
  progressPct,
  callsToday,
}: {
  rank: number | null;
  salesThisMonth: number;
  progressPct: number | null;
  callsToday: number;
}) {
  const t = useTranslations();
  const badges = getBadges({ rank, salesThisMonth, progressPct, callsToday });
  if (badges.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {badges.map((code) => {
        const Icon = BADGE_ICONS[code];
        return (
          <Tooltip key={code}>
            <TooltipTrigger
              render={
                <Badge
                  variant="outline"
                  className={`size-5 justify-center p-0 ${BADGE_CLASSES[code]}`}
                >
                  <Icon className="size-3" />
                </Badge>
              }
            />
            <TooltipContent>{t.gamification.badgeLabels[code]}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

export function StreakIndicator({ days }: { days: number }) {
  const t = useTranslations();
  if (days < 2) return <span className="text-muted-foreground">—</span>;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="inline-flex items-center gap-1 font-medium text-orange-600 dark:text-orange-400">
            <Flame className="size-3.5" />
            {days}
          </span>
        }
      />
      <TooltipContent>
        {days} {t.gamification.streakDaysSuffix}
      </TooltipContent>
    </Tooltip>
  );
}
