import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth/dal";
import { generateTotpSecret, buildTotpUri } from "@/lib/auth/totp";
import { encryptTotpSecret } from "@/lib/auth/totp-encryption";
import { errorResponseBody } from "@/lib/errors";

export async function POST() {
  try {
    const actor = await requireApiRole(["ADMIN"]);
    const secret = generateTotpSecret();

    await prisma.user.update({
      where: { id: actor.id },
      data: { totpSecret: encryptTotpSecret(secret), totpEnabled: false, totpBackupCodes: [] },
    });

    const otpauthUri = buildTotpUri(secret, actor.username);
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUri);

    return NextResponse.json({ secret, otpauthUri, qrCodeDataUrl });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
