import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionCookie, createPending2faCookie } from "@/lib/auth/session";
import { checkIpLoginRateLimit, checkAccountLoginRateLimit } from "@/lib/auth/rate-limit";
import { writeAuditLog } from "@/lib/audit";
import { errorResponseBody, TooManyRequestsError, ValidationError } from "@/lib/errors";

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

    try {
      await checkIpLoginRateLimit(ipAddress);
    } catch (error) {
      if (error instanceof TooManyRequestsError) {
        await writeAuditLog({ action: "LOGIN_RATE_LIMITED", details: { username, scope: "ip" }, ipAddress });
      }
      throw error;
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !user.isActive) {
      await writeAuditLog({
        action: "LOGIN_FAILED",
        details: { username },
        ipAddress,
      });
      return NextResponse.json({ message: "auth.invalidCredentials" }, { status: 401 });
    }

    try {
      await checkAccountLoginRateLimit(user.id);
    } catch (error) {
      if (error instanceof TooManyRequestsError) {
        await writeAuditLog({
          actorUserId: user.id,
          actorRole: user.role,
          action: "LOGIN_RATE_LIMITED",
          details: { username, scope: "account" },
          ipAddress,
        });
      }
      throw error;
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

    if (user.totpEnabled) {
      await createPending2faCookie(user.id);
      return NextResponse.json({ requires2fa: true });
    }

    await createSessionCookie({ userId: user.id, role: user.role, sessionVersion: user.sessionVersion });
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
