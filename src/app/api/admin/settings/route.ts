import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit";
import { getAppSettings } from "@/lib/settings";
import { updateSettingsSchema } from "@/lib/validation/settings";
import { ValidationError, errorResponseBody } from "@/lib/errors";

export async function PATCH(request: Request) {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const body = await request.json();
    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);

    await getAppSettings(); // ensures the singleton row exists before updating it
    const updated = await prisma.appSettings.update({
      where: { id: "singleton" },
      data: { defaultCountryCode: parsed.data.defaultCountryCode },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "SETTINGS_UPDATED",
      details: { defaultCountryCode: updated.defaultCountryCode },
    });

    return NextResponse.json({ defaultCountryCode: updated.defaultCountryCode });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
