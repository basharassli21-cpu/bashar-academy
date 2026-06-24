import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSessionCookie } from "@/lib/auth/session";
import { Role } from "@/generated/prisma/enums";
import { errorResponseBody, ValidationError } from "@/lib/errors";

const registerSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("fullName and password are required");

    const { fullName, email, phone, password } = parsed.data;

    const baseUsername = fullName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20);
    const existing = await prisma.user.findUnique({ where: { username: baseUsername } });
    const username = existing ? `${baseUsername}${Math.floor(Math.random() * 1000)}` : baseUsername;

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        fullName,
        email: email || null,
        phone: phone || null,
        role: Role.STUDENT,
      },
    });

    await createSessionCookie({ userId: user.id, role: user.role as "STUDENT", sessionVersion: user.sessionVersion });

    return NextResponse.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
