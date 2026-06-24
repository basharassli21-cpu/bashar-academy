import { getCurrentUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { BookingsClient } from "@/components/academy/bookings-client";

export default async function BookingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [bookings, availableSlots] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: user.id },
      include: { slot: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.consultationSlot.findMany({
      where: {
        available: true,
        date: { gte: new Date() },
      },
      orderBy: { date: "asc" },
    }),
  ]);

  return (
    <BookingsClient
      bookings={JSON.parse(JSON.stringify(bookings))}
      availableSlots={JSON.parse(JSON.stringify(availableSlots))}
    />
  );
}
