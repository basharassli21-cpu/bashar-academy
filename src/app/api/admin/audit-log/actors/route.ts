import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { errorResponseBody } from "@/lib/errors";

export async function GET() {
  try {
    await requireApiRole(["ADMIN"]);

    const actors = await prisma.user.findMany({
      where: { auditLogs: { some: {} } },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    });

    return NextResponse.json({ items: actors });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
