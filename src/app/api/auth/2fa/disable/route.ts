import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth/dal";
import { verifyPassword } from "@/lib/auth/password";
import { writeAuditLog } from "@/lib/audit";
import { UnauthorizedError, ValidationError, errorResponseBody } from "@/lib/errors";

const disableSchema = z.object({ password: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const actor = await requireApiUser();
    const body = await request.json();
    const parsed = disableSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Your password is required");

    const user = await prisma.user.findUnique({ where: { id: actor.id } });
    if (!user) throw new UnauthorizedError();

    const passwordOk = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!passwordOk) throw new ValidationError("auth.invalidCredentials");

    await prisma.user.update({
      where: { id: actor.id },
      data: { totpEnabled: false, totpSecret: null, totpBackupCodes: [] },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "TWO_FACTOR_DISABLED",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
