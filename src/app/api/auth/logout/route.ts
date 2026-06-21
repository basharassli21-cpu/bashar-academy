import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/dal";
import { deleteSessionCookie } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit";

export async function POST() {
  const user = await getCurrentUser();
  await deleteSessionCookie();
  if (user) {
    await writeAuditLog({ actorUserId: user.id, actorRole: user.role, action: "LOGOUT" });
  }
  return NextResponse.json({ success: true });
}
