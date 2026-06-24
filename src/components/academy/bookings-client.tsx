"use client";

import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/components/providers/locale-provider";

interface BookingsClientProps {
  bookings: Array<{
    id: string;
    status: string;
    notes: string | null;
    meetLink: string | null;
    createdAt: string;
    slot: {
      id: string;
      date: string;
      startTime: string;
      endTime: string;
    } | null;
  }>;
  availableSlots: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
  }>;
}

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  COMPLETED: "outline",
  CANCELLED: "destructive",
  RESCHEDULED: "secondary",
};

export function BookingsClient({ bookings, availableSlots }: BookingsClientProps) {
  const t = useTranslations();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{t.academy.myBookings}</h1>
        <ButtonLink href={`/checkout?type=consultation`}>
          <Calendar className="h-4 w-4 ml-2" />
          {t.academy.bookConsultation}
        </ButtonLink>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t.academy.noSlots}</h2>
            <p className="text-muted-foreground mb-6">Book a consultation with our team</p>
            <ButtonLink href={`/checkout?type=consultation`}>
              {t.academy.bookConsultation}
            </ButtonLink>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{t.academy.bookConsultation}</p>
                    {booking.slot ? (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(booking.slot.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {booking.slot.startTime} - {booking.slot.endTime}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">Slot no longer available</p>
                    )}
                    {booking.meetLink && (
                      <a
                        href={booking.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline mt-1 inline-block"
                      >
                        Join Meeting
                      </a>
                    )}
                    {booking.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{booking.notes}</p>
                    )}
                  </div>
                </div>
                <Badge variant={statusVariant[booking.status] || "secondary"}>
                  {booking.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {availableSlots.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">{t.academy.availableSlots}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableSlots.slice(0, 6).map((slot) => (
              <Card key={slot.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(slot.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{slot.startTime} - {slot.endTime}</span>
                  </div>
                  <ButtonLink size="sm" className="w-full" href={`/checkout?type=consultation&slotId=${slot.id}`}>
                    {t.academy.bookConsultation}
                  </ButtonLink>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
