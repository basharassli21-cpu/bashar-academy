import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { errorResponseBody } from "@/lib/errors";
import { detectAnomalies } from "@/lib/audit/anomaly-detection";

const LOOKBACK_DAYS = 7;
const MAX_ROWS = 5000;

export async function GET() {
  try {
    await requireApiRole(["ADMIN"]);

    const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
    const rows = await prisma.auditLog.findMany({
      where: { createdAt: { gte: since } },
      select: {
        id: true,
        action: true,
        actorUserId: true,
        details: true,
        ipAddress: true,
        createdAt: true,
        actor: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: MAX_ROWS,
    });

    const items = detectAnomalies(rows);
    return NextResponse.json({ items });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
