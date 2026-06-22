import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth/dal";
import { sendTestPing } from "@/lib/webhooks";
import { NotFoundError, errorResponseBody } from "@/lib/errors";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiRole(["ADMIN"]);
    const { id } = await params;

    const status = await sendTestPing(id);
    if (status === null) throw new NotFoundError();

    return NextResponse.json({ status });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
