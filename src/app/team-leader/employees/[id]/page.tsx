import { requireRole } from "@/lib/auth/dal";
import { EmployeeMonitoringClient } from "@/components/employee-monitoring-client";

export default async function TeamLeaderEmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["TEAM_LEADER"]);
  const { id } = await params;
  return (
    <EmployeeMonitoringClient
      employeeId={id}
      basePath="team-leader"
      backHref="/team-leader"
      linkToLeads={false}
    />
  );
}
