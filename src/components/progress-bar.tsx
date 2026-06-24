export type PaceStatus = "ON_TRACK" | "SLIGHTLY_BEHIND" | "BEHIND";

export function getPaceStatus(percent: number, pacePercent: number): PaceStatus {
  if (percent >= pacePercent) return "ON_TRACK";
  if (percent >= pacePercent - 15) return "SLIGHTLY_BEHIND";
  return "BEHIND";
}

const PACE_FILL_CLASSES: Record<PaceStatus, string> = {
  ON_TRACK: "bg-emerald-500",
  SLIGHTLY_BEHIND: "bg-amber-500",
  BEHIND: "bg-red-500",
};

export function ProgressBar({
  percent,
  pacePercent,
}: {
  percent: number;
  pacePercent?: number;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  const fillClass =
    pacePercent === undefined ? "bg-primary" : PACE_FILL_CLASSES[getPaceStatus(percent, pacePercent)];

  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className={`h-full rounded-full ${fillClass} transition-[width]`} style={{ width: `${clamped}%` }} />
      {pacePercent !== undefined && pacePercent > 0 && pacePercent < 100 && (
        <div
          className="absolute inset-y-0 w-px bg-foreground/50"
          style={{ left: `${pacePercent}%` }}
        />
      )}
    </div>
  );
}
