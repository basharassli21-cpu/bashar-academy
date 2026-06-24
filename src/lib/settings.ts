import "server-only";
import { prisma } from "@/lib/prisma";

// Lazily creates the singleton settings row, seeded from the env var
// default the first time anything asks for it — so existing deployments
// don't need a manual data migration before this feature shipped. Upsert
// (rather than find-then-create) keeps this safe under concurrent
// requests racing to create the same row.
export async function getAppSettings() {
  return prisma.appSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", defaultCountryCode: process.env.DEFAULT_COUNTRY_CODE ?? "962" },
    update: {},
  });
}
