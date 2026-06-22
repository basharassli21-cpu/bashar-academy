import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth/dal";
import { NotFoundError, errorResponseBody } from "@/lib/errors";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiUser();
    const { id } = await params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== user.id) throw new NotFoundError();

    await prisma.notification.update({ where: { id }, data: { isRead: true } });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
