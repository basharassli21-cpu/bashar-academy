import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth/dal";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { createSessionCookie } from "@/lib/auth/session";
import { changePasswordSchema } from "@/lib/validation/auth";
import { writeAuditLog } from "@/lib/audit";
import { UnauthorizedError, ValidationError, errorResponseBody } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const actor = await requireApiUser();
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);

    const user = await prisma.user.findUnique({ where: { id: actor.id } });
    if (!user) throw new UnauthorizedError();

    const passwordOk = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!passwordOk) throw new ValidationError("auth.invalidCredentials");

    const passwordHash = await hashPassword(parsed.data.newPassword);
    const updated = await prisma.user.update({
      where: { id: actor.id },
      data: { passwordHash, sessionVersion: { increment: 1 } },
      select: { sessionVersion: true },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "PASSWORD_CHANGED",
    });

    // Re-issue a session for this tab at the new version — every other
    // outstanding session for this account fails its next sessionVersion
    // check and is bounced to login.
    await createSessionCookie({ userId: actor.id, role: actor.role, sessionVersion: updated.sessionVersion });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
