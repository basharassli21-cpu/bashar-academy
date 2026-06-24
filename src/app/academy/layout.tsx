import { requireRole } from "@/lib/auth/dal";
import { AcademyHeader } from "@/components/academy/academy-header";

export default async function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["ADMIN", "STUDENT"]);
  return (
    <div className="min-h-screen flex flex-col">
      <AcademyHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
