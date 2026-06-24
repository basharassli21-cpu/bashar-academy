import "server-only";
import { prisma } from "@/lib/prisma";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function expectedMonthPacePct() {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.round((now.getDate() / daysInMonth) * 100);
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

const STREAK_LOOKBACK_DAYS = 90;

// Current consecutive-day streak of logging at least one call note, walking
// backwards from today. Today is allowed to be empty so far (the streak
// stays "alive" until the day actually ends without activity).
async function computeStreakDays(employeeId: string): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - STREAK_LOOKBACK_DAYS);
  since.setHours(0, 0, 0, 0);

  const notes = await prisma.leadNote.findMany({
    where: { employeeId, createdAt: { gte: since } },
    select: { createdAt: true },
  });

  const activeDays = new Set(notes.map((n) => dateKey(n.createdAt)));

  let streak = 0;
  const cursor = new Date();
  if (!activeDays.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (activeDays.has(dateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export async function getEmployeeSummary(employeeId: string) {
  const todayStart = startOfToday();
  const monthStart = startOfMonth();

  const [employee, callsToday, callsThisMonth, salesThisMonth, activeLeadsCount, streakDays] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: employeeId },
        select: {
          id: true,
          fullName: true,
          username: true,
          monthlyTarget: true,
          isActive: true,
          teamLeaderId: true,
          teamLeader: { select: { fullName: true } },
        },
      }),
      prisma.leadNote.count({ where: { employeeId, createdAt: { gte: todayStart } } }),
      prisma.leadNote.count({ where: { employeeId, createdAt: { gte: monthStart } } }),
      prisma.lead.count({
        where: {
          ownerEmployeeId: employeeId,
          status: "CLOSED_SALE",
          closedAt: { gte: monthStart },
          deletedAt: null,
        },
      }),
      prisma.lead.count({
        where: {
          ownerEmployeeId: employeeId,
          status: { notIn: ["CLOSED_SALE", "CANCELLED"] },
          deletedAt: null,
        },
      }),
      computeStreakDays(employeeId),
    ]);

  if (!employee) return null;

  const progressPct = employee.monthlyTarget
    ? Math.round((salesThisMonth / employee.monthlyTarget) * 100)
    : null;
  const expectedPacePct = employee.monthlyTarget ? expectedMonthPacePct() : null;

  return {
    employee,
    callsToday,
    callsThisMonth,
    salesThisMonth,
    activeLeadsCount,
    progressPct,
    expectedPacePct,
    streakDays,
  };
}

export async function getEmployeeActivity(
  employeeId: string,
  { skip, take }: { skip: number; take: number }
) {
  const [items, total] = await Promise.all([
    prisma.leadNote.findMany({
      where: { employeeId },
      select: {
        id: true,
        note: true,
        statusAtTime: true,
        createdAt: true,
        lead: { select: { id: true, customerName: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.leadNote.count({ where: { employeeId } }),
  ]);
  return { items, total };
}
