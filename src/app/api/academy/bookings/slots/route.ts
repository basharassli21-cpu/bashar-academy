import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponseBody } from "@/lib/errors";

export async function GET() {
  try {
    const slots = await prisma.consultationSlot.findMany({
      where: { available: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        _count: { select: { bookings: true } },
      },
    });

    const available = slots.filter((s) => s._count.bookings === 0);

    return NextResponse.json(available);
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
