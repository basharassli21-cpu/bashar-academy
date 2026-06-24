import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth/dal";
import { errorResponseBody, ValidationError } from "@/lib/errors";
import { z } from "zod";

const createTicketSchema = z.object({
  subject: z.string().min(1),
  message: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});

export async function GET() {
  try {
    const user = await requireApiUser();

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        subject: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { message: true, createdAt: true },
        },
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const parsed = createTicketSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const { subject, message, priority } = parsed.data;

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject,
        priority: priority ?? "MEDIUM",
        messages: {
          create: {
            userId: user.id,
            message,
          },
        },
      },
      select: {
        id: true,
        subject: true,
        status: true,
        priority: true,
        createdAt: true,
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
