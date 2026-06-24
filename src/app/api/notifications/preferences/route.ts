import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth/dal";
import { ValidationError, errorResponseBody } from "@/lib/errors";

const preferencesSchema = z.object({
  notificationsMuted: z.boolean().optional(),
  notificationDigestMode: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  try {
    const actor = await requireApiUser();
    const body = await request.json();
    const parsed = preferencesSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);

    const updated = await prisma.user.update({
      where: { id: actor.id },
      data: parsed.data,
      select: { notificationsMuted: true, notificationDigestMode: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
