export type EmployeeListItem = {
  id: string;
  username: string;
  fullName: string;
  role: "SALES_EMPLOYEE" | "TEAM_LEADER";
  monthlyTarget: number | null;
  isActive: boolean;
  createdAt: string;
  teamLeaderId: string | null;
  teamLeader?: { id: string; fullName: string } | null;
  _count?: { employees: number };
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

async function parseOrThrow(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Request failed");
  return data;
}

export async function fetchEmployees(params: {
  role: "SALES_EMPLOYEE" | "TEAM_LEADER";
  q?: string;
  teamLeaderId?: string;
  isActive?: boolean;
  page?: number;
}): Promise<PaginatedResult<EmployeeListItem>> {
  const search = new URLSearchParams();
  search.set("role", params.role);
  if (params.q) search.set("q", params.q);
  if (params.teamLeaderId) search.set("teamLeaderId", params.teamLeaderId);
  if (params.isActive !== undefined) search.set("isActive", String(params.isActive));
  if (params.page) search.set("page", String(params.page));
  const res = await fetch(`/api/admin/employees?${search.toString()}`);
  return parseOrThrow(res);
}

export type CreateEmployeeInput = {
  username: string;
  password: string;
  fullName: string;
  role: "SALES_EMPLOYEE" | "TEAM_LEADER";
  monthlyTarget?: number | null;
  teamLeaderId?: string | null;
};

export async function createEmployee(input: CreateEmployeeInput) {
  const res = await fetch("/api/admin/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

export type UpdateEmployeeInput = {
  fullName?: string;
  monthlyTarget?: number | null;
  newPassword?: string;
  teamLeaderId?: string | null;
};

export async function updateEmployee(id: string, input: UpdateEmployeeInput) {
  const res = await fetch(`/api/admin/employees/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

export async function deactivateEmployee(id: string) {
  const res = await fetch(`/api/admin/employees/${id}/deactivate`, { method: "PATCH" });
  return parseOrThrow(res);
}

export async function reactivateEmployee(id: string) {
  const res = await fetch(`/api/admin/employees/${id}/reactivate`, { method: "PATCH" });
  return parseOrThrow(res);
}

export async function assignEmployeeToLeader(teamLeaderId: string, employeeId: string) {
  const res = await fetch(`/api/admin/team-leaders/${teamLeaderId}/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId }),
  });
  return parseOrThrow(res);
}

export async function unassignEmployeeFromLeader(teamLeaderId: string, employeeId: string) {
  const res = await fetch(`/api/admin/team-leaders/${teamLeaderId}/unassign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId }),
  });
  return parseOrThrow(res);
}
