import { requireRole } from "@/lib/auth/dal";
import { EmployeesPageClient } from "@/components/admin/employees/employees-page-client";

export default async function EmployeesPage() {
  await requireRole(["ADMIN"]);
  return <EmployeesPageClient />;
}
