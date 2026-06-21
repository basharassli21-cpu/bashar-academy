import { requireRole } from "@/lib/auth/dal";
import { SalesShell } from "@/components/sales/sales-shell";

export default async function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["SALES_EMPLOYEE"]);
  return <SalesShell user={user}>{children}</SalesShell>;
}
