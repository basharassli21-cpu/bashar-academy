import { getCurrentUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { CertificatesClient } from "@/components/academy/certificates-client";

export default async function CertificatesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const certificates = await prisma.certificate.findMany({
    where: { userId: user.id },
    include: { course: true },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <CertificatesClient
      certificates={JSON.parse(JSON.stringify(certificates))}
    />
  );
}
