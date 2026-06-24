import "server-only";

const TREND_DAYS = 14;

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function trendRangeStart(): Date {
  const d = new Date();
  d.setDate(d.getDate() - (TREND_DAYS - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

// Buckets two already-fetched timestamp lists into a fixed-length daily series
// covering the last TREND_DAYS days (including empty days), using local-time
// day boundaries so it matches the dashboard's other "today"/"this month" stats.
export function buildDailyTrend(
  primaryDates: Date[],
  secondaryDates: Date[]
): { date: string; primary: number; secondary: number }[] {
  const primaryCounts = new Map<string, number>();
  for (const d of primaryDates) {
    const key = dateKey(d);
    primaryCounts.set(key, (primaryCounts.get(key) ?? 0) + 1);
  }
  const secondaryCounts = new Map<string, number>();
  for (const d of secondaryDates) {
    const key = dateKey(d);
    secondaryCounts.set(key, (secondaryCounts.get(key) ?? 0) + 1);
  }

  const result: { date: string; primary: number; secondary: number }[] = [];
  const cursor = trendRangeStart();
  for (let i = 0; i < TREND_DAYS; i++) {
    const key = dateKey(cursor);
    result.push({
      date: key,
      primary: primaryCounts.get(key) ?? 0,
      secondary: secondaryCounts.get(key) ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}
