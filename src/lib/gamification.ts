export type BadgeCode = "TOP_PERFORMER" | "TARGET_HIT" | "POWER_CALLER";

const POWER_CALLER_THRESHOLD = 10;

// Pure rule-based badges (no ML/LLM) derived entirely from numbers already
// shown on the leaderboard, so a rep can see exactly why a badge appeared.
export function getBadges(input: {
  rank: number | null;
  salesThisMonth: number;
  progressPct: number | null;
  callsToday: number;
}): BadgeCode[] {
  const badges: BadgeCode[] = [];
  if (input.rank === 0 && input.salesThisMonth > 0) badges.push("TOP_PERFORMER");
  if (input.progressPct !== null && input.progressPct >= 100) badges.push("TARGET_HIT");
  if (input.callsToday >= POWER_CALLER_THRESHOLD) badges.push("POWER_CALLER");
  return badges;
}
