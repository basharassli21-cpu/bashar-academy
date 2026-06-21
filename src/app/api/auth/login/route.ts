import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionCookie } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit";
import { errorResponseBody, ValidationError } from "@/lib/errors";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Username and password are required");

    const username = parsed.data.username.trim().toLowerCase();
    const ipAddress = request.headers.get("x-forwarded-for");

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !user.isActive) {
      await writeAuditLog({
        action: "LOGIN_FAILED",
        details: { username },
        ipAddress,
      });
      return NextResponse.json({ message: "auth.invalidCredentials" }, { status: 401 });
    }

    const passwordOk = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!passwordOk) {
      await writeAuditLog({
        actorUserId: user.id,
        actorRole: user.role,
        action: "LOGIN_FAILED",
        details: { username },
        ipAddress,
      });
      return NextResponse.json({ message: "auth.invalidCredentials" }, { status: 401 });
    }

    await createSessionCookie({ userId: user.id, role: user.role });
    await writeAuditLog({
      actorUserId: user.id,
      actorRole: user.role,
      action: "LOGIN",
      ipAddress,
    });

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
