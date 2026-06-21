import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth/dal";
import { getEmployeeSummary, getEmployeeActivity } from "@/lib/stats/employee";
import { parsePagination, paginatedResponse } from "@/lib/pagination";
import { NotFoundError, errorResponseBody } from "@/lib/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiRole(["ADMIN"]);
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const { page, skip, take, pageSize } = parsePagination(searchParams);

    const summary = await getEmployeeSummary(id);
    if (!summary) throw new NotFoundError();

    const { items, total } = await getEmployeeActivity(id, { skip, take });

    return NextResponse.json({
      ...summary,
      activity: paginatedResponse(items, total, page, pageSize),
    });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
