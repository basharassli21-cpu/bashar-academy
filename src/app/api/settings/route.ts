import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/dal";
import { getAppSettings } from "@/lib/settings";
import { errorResponseBody } from "@/lib/errors";

// Readable by any authenticated role — phone click-to-call/WhatsApp links
// on Sales/Team Leader pages need the current country code too, not just
// the admin Settings page.
export async function GET() {
  try {
    await requireApiUser();
    const settings = await getAppSettings();
    return NextResponse.json({ defaultCountryCode: settings.defaultCountryCode });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
