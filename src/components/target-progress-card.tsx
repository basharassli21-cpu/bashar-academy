"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar, getPaceStatus, type PaceStatus } from "@/components/progress-bar";
import { useTranslations } from "@/components/providers/locale-provider";

const PACE_BADGE_CLASSES: Record<PaceStatus, string> = {
  ON_TRACK:
    "border-transparent bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  SLIGHTLY_BEHIND:
    "border-transparent bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  BEHIND: "border-transparent bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400",
};

export function TargetProgressCard({
  monthlyTarget,
  salesThisMonth,
  progressPct,
  expectedPacePct,
}: {
  monthlyTarget: number | null;
  salesThisMonth: number;
  progressPct: number | null;
  expectedPacePct: number | null;
}) {
  const t = useTranslations();
  const paceLabels: Record<PaceStatus, string> = {
    ON_TRACK: t.salesDashboard.paceOnTrack,
    SLIGHTLY_BEHIND: t.salesDashboard.paceSlightlyBehind,
    BEHIND: t.salesDashboard.paceBehind,
  };
  const pace =
    progressPct !== null && expectedPacePct !== null
      ? getPaceStatus(progressPct, expectedPacePct)
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.salesDashboard.targetProgress}</CardTitle>
      </CardHeader>
      <CardContent>
        {monthlyTarget ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {salesThisMonth} / {monthlyTarget}
              </span>
              <span className="flex items-center gap-2">
                {pace && (
                  <Badge variant="outline" className={PACE_BADGE_CLASSES[pace]}>
                    {paceLabels[pace]}
                  </Badge>
                )}
                {progressPct}%
              </span>
            </div>
            <ProgressBar percent={progressPct ?? 0} pacePercent={expectedPacePct ?? undefined} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.salesDashboard.noTarget}</p>
        )}
      </CardContent>
    </Card>
  );
}
