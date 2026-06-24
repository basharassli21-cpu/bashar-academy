import { requireRole } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Check, X, Clock, CalendarDays } from "lucide-react";
type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";

const statusColors: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  COMPLETED: "outline",
  CANCELLED: "destructive",
  RESCHEDULED: "secondary",
};

export default async function AdminAcademyBookingsPage() {
  await requireRole(["ADMIN"]);

  const [bookings, slots] = await Promise.all([
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { fullName: true, email: true } },
        slot: true,
      },
    }),
    prisma.consultationSlot.findMany({
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 50,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <p className="text-sm text-muted-foreground">
          Consultation bookings and slot management
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Slots</CardTitle>
          <Button size="sm">
            <Plus className="size-4" />
            Add Slot
          </Button>
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No consultation slots created
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {slot.date.toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={slot.available ? "default" : "secondary"}
                  >
                    {slot.available ? "Available" : "Booked"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Meet Link</TableHead>
              <TableHead>Booked At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No bookings yet
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {booking.user.fullName}
                      </span>
                      {booking.user.email && (
                        <span className="text-xs text-muted-foreground">
                          {booking.user.email}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {booking.slot.date.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {booking.slot.startTime} - {booking.slot.endTime}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[booking.status]}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate text-sm">
                    {booking.notes ?? "-"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {booking.meetLink ? (
                      <a
                        href={booking.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Link
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {booking.createdAt.toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
