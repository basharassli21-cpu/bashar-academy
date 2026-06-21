import { requireRole } from "@/lib/auth/dal";
import { EmployeeMonitoringClient } from "@/components/employee-monitoring-client";

export default async function AdminEmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { id } = await params;
  return (
    <EmployeeMonitoringClient
      employeeId={id}
      basePath="admin"
      backHref="/admin/employees"
      linkToLeads
    />
  );
}
