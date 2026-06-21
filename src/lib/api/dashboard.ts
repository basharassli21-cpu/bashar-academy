import type { LeadStatus, PaginatedResult } from "@/lib/api/leads";

async function parseOrThrow(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Request failed");
  return data;
}

export type AdminDashboardStats = {
  totalLeads: number;
  openPoolCount: number;
  activeSalesEmployees: number;
  activeTeamLeaders: number;
  newLeadsToday: number;
  callsToday: number;
  closedThisMonth: number;
  conversionRate: number;
};

export async function fetchAdminDashboard(): Promise<AdminDashboardStats> {
  const res = await fetch("/api/admin/dashboard");
  return parseOrThrow(res);
}

export type EmployeeSummary = {
  employee: {
    id: string;
    fullName: string;
    username: string;
    monthlyTarget: number | null;
    isActive: boolean;
    teamLeaderId: string | null;
    teamLeader: { fullName: string } | null;
  };
  callsToday: number;
  callsThisMonth: number;
  salesThisMonth: number;
  activeLeadsCount: number;
  progressPct: number | null;
};

export type DueTodayLead = {
  id: string;
  customerName: string;
  status: LeadStatus;
  nextFollowupDate: string | null;
};

export type SalesDashboardStats = EmployeeSummary & { dueToday: DueTodayLead[] };

export async function fetchSalesDashboard(): Promise<SalesDashboardStats> {
  const res = await fetch("/api/sales/dashboard");
  return parseOrThrow(res);
}

export type TeamLeaderDashboardStats = {
  teamSize: number;
  callsTodayTotal: number;
  salesThisMonthTotal: number;
  avgProgressPct: number | null;
  employees: EmployeeSummary[];
};

export async function fetchTeamLeaderDashboard(): Promise<TeamLeaderDashboardStats> {
  const res = await fetch("/api/team-leader/dashboard");
  return parseOrThrow(res);
}

export type ActivityItem = {
  id: string;
  note: string;
  statusAtTime: LeadStatus;
  createdAt: string;
  lead: { id: string; customerName: string };
};

export type EmployeeDetailStats = EmployeeSummary & { activity: PaginatedResult<ActivityItem> };

export async function fetchAdminEmployeeStats(
  id: string,
  page = 1
): Promise<EmployeeDetailStats> {
  const res = await fetch(`/api/admin/employees/${id}/stats?page=${page}`);
  return parseOrThrow(res);
}

export async function fetchTeamLeaderEmployeeStats(
  id: string,
  page = 1
): Promise<EmployeeDetailStats> {
  const res = await fetch(`/api/team-leader/employees/${id}/stats?page=${page}`);
  return parseOrThrow(res);
}
