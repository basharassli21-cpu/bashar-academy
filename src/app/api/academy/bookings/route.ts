import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { errorResponseBody, ConflictError, ValidationError } from "@/lib/errors";
import { z } from "zod";

const createBookingSchema = z.object({
  slotId: z.string().min(1),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireApiUser();

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        notes: true,
        meetLink: true,
        createdAt: true,
        slot: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
          },
        },
        payment: {
          select: { status: true, amount: true },
        },
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const { slotId, notes } = parsed.data;

    const slot = await prisma.consultationSlot.findUnique({ where: { id: slotId } });
    if (!slot || !slot.available) throw new ConflictError("Slot is not available");

    const existingBooking = await prisma.booking.findFirst({
      where: { slotId, status: { notIn: ["CANCELLED"] } },
    });
    if (existingBooking) throw new ConflictError("Slot is already booked");

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        slotId,
        notes: notes ?? null,
        status: "PENDING",
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        slot: {
          select: { id: true, date: true, startTime: true, endTime: true },
        },
      },
    });

    await writeAuditLog({
      actorUserId: user.id,
      actorRole: user.role,
      action: "BOOKING_CREATED",
      entityType: "Booking",
      entityId: booking.id,
      details: { slotId },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
