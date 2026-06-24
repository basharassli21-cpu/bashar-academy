import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth/dal";
import { hashPassword } from "@/lib/auth/password";
import { verifyTotpCode, generateBackupCodes } from "@/lib/auth/totp";
import { decryptTotpSecret } from "@/lib/auth/totp-encryption";
import { writeAuditLog } from "@/lib/audit";
import { ValidationError, errorResponseBody } from "@/lib/errors";

const confirmSchema = z.object({ code: z.string().trim().regex(/^\d{6}$/) });

export async function POST(request: Request) {
  try {
    const actor = await requireApiUser();
    const body = await request.json();
    const parsed = confirmSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("A 6-digit code is required");

    const user = await prisma.user.findUnique({ where: { id: actor.id } });
    if (!user?.totpSecret) throw new ValidationError("Start setup again before confirming");

    const valid = verifyTotpCode(decryptTotpSecret(user.totpSecret), parsed.data.code);
    if (!valid) throw new ValidationError("auth.invalidTwoFactorCode");

    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = await Promise.all(backupCodes.map((code) => hashPassword(code)));

    await prisma.user.update({
      where: { id: actor.id },
      data: { totpEnabled: true, totpBackupCodes: hashedBackupCodes },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "TWO_FACTOR_ENABLED",
    });

    return NextResponse.json({ backupCodes });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
