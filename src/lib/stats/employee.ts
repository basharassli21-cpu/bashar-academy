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

export async function getEmployeeSummary(employeeId: string) {
  const todayStart = startOfToday();
  const monthStart = startOfMonth();

  const [employee, callsToday, callsThisMonth, salesThisMonth, activeLeadsCount] =
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
        where: { ownerEmployeeId: employeeId, status: "CLOSED_SALE", closedAt: { gte: monthStart } },
      }),
      prisma.lead.count({
        where: { ownerEmployeeId: employeeId, status: { notIn: ["CLOSED_SALE", "CANCELLED"] } },
      }),
    ]);

  if (!employee) return null;

  const progressPct = employee.monthlyTarget
    ? Math.round((salesThisMonth / employee.monthlyTarget) * 100)
    : null;

  return { employee, callsToday, callsThisMonth, salesThisMonth, activeLeadsCount, progressPct };
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
