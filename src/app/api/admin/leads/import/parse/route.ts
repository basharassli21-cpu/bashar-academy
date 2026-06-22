import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth/dal";
import { parseImportFile } from "@/lib/leads/import-parser";
import { ValidationError, errorResponseBody } from "@/lib/errors";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    await requireApiRole(["ADMIN"]);
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) throw new ValidationError("No file was uploaded");
    if (file.size > MAX_FILE_SIZE_BYTES) throw new ValidationError("File is too large (10MB max)");

    const rows = await parseImportFile(file);
    if (rows.length === 0) throw new ValidationError("No rows found in this file");
    if (rows.length > 5000) throw new ValidationError("A single import is limited to 5000 rows");

    return NextResponse.json({ rows });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
