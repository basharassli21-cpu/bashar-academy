import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { verifyTotpCode } from "@/lib/auth/totp";
import { decryptTotpSecret } from "@/lib/auth/totp-encryption";
import {
  readPending2faUserId,
  deletePending2faCookie,
  createSessionCookie,
} from "@/lib/auth/session";
import { checkAccountLoginRateLimit } from "@/lib/auth/rate-limit";
import { writeAuditLog } from "@/lib/audit";
import { errorResponseBody, TooManyRequestsError, UnauthorizedError, ValidationError } from "@/lib/errors";

const verifySchema = z.object({
  code: z.string().trim().min(6).max(16),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("A code is required");

    const ipAddress = request.headers.get("x-forwarded-for");
    const userId = await readPending2faUserId();
    if (!userId) throw new UnauthorizedError("Your login attempt expired. Please log in again.");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive || !user.totpEnabled || !user.totpSecret) {
      await deletePending2faCookie();
      throw new UnauthorizedError("Your login attempt expired. Please log in again.");
    }

    try {
      await checkAccountLoginRateLimit(user.id);
    } catch (error) {
      if (error instanceof TooManyRequestsError) {
        await writeAuditLog({
          actorUserId: user.id,
          actorRole: user.role,
          action: "LOGIN_RATE_LIMITED",
          details: { username: user.username, scope: "account" },
          ipAddress,
        });
      }
      throw error;
    }

    const code = parsed.data.code.replace(/\s|-/g, "");
    const totpValid = verifyTotpCode(decryptTotpSecret(user.totpSecret), code);

    let usedBackupCode = false;
    if (!totpValid) {
      for (const hashedBackupCode of user.totpBackupCodes) {
        if (await verifyPassword(code, hashedBackupCode)) {
          usedBackupCode = true;
          await prisma.user.update({
            where: { id: user.id },
            data: { totpBackupCodes: user.totpBackupCodes.filter((c) => c !== hashedBackupCode) },
          });
          break;
        }
      }
    }

    if (!totpValid && !usedBackupCode) {
      await writeAuditLog({
        actorUserId: user.id,
        actorRole: user.role,
        action: "LOGIN_FAILED",
        details: { username: user.username, reason: "invalid_2fa_code" },
        ipAddress,
      });
      return NextResponse.json({ message: "auth.invalidTwoFactorCode" }, { status: 401 });
    }

    await deletePending2faCookie();
    await createSessionCookie({ userId: user.id, role: user.role, sessionVersion: user.sessionVersion });
    await writeAuditLog({
      actorUserId: user.id,
      actorRole: user.role,
      action: "LOGIN",
      details: usedBackupCode ? { via: "backup_code" } : { via: "totp" },
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
