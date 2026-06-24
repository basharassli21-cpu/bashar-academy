import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth/dal";
import { getSignedUploadUrl } from "@/lib/r2";
import { errorResponseBody, ValidationError } from "@/lib/errors";
import { z } from "zod";

const uploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    await requireApiRole(["ADMIN"]);
    const body = await request.json();
    const parsed = uploadSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const { filename, contentType } = parsed.data;

    const key = `${Date.now()}-${filename}`;
    const signedUrl = await getSignedUploadUrl(key, contentType);

    return NextResponse.json({ signedUrl, key: `videos/${key}` });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
