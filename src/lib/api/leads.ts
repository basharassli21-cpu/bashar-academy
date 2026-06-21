export const LEAD_STATUS_VALUES = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "NOT_INTERESTED",
  "CLOSED_SALE",
  "CANCELLED",
] as const;

export type LeadStatus = (typeof LEAD_STATUS_VALUES)[number];

export type LeadListItem = {
  id: string;
  customerName: string;
  phone: string;
  status: LeadStatus;
  ownerEmployeeId?: string | null;
  owner?: { id: string; fullName: string } | null;
  lastContactDate: string | null;
  nextFollowupDate: string | null;
  createdAt: string;
};

export type LeadNoteItem = {
  id: string;
  note: string;
  statusAtTime: LeadStatus;
  createdAt: string;
  employee: { id: string; fullName: string };
};

export type LeadDetail = LeadListItem & {
  closedAt: string | null;
  createdBy?: { id: string; fullName: string };
  notes: LeadNoteItem[];
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

function buildLeadSearch(params: { q?: string; status?: LeadStatus | ""; ownerEmployeeId?: string; page?: number }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.ownerEmployeeId) search.set("ownerEmployeeId", params.ownerEmployeeId);
  if (params.page) search.set("page", String(params.page));
  return search;
}

export async function fetchAdminLeads(params: {
  q?: string;
  status?: LeadStatus | "";
  ownerEmployeeId?: string;
  page?: number;
}): Promise<PaginatedResult<LeadListItem>> {
  const search = buildLeadSearch(params);
  const res = await fetch(`/api/admin/leads?${search.toString()}`);
  return parseOrThrow(res);
}

export async function fetchAdminLead(id: string): Promise<LeadDetail> {
  const res = await fetch(`/api/admin/leads/${id}`);
  return parseOrThrow(res);
}

export type CreateLeadInput = {
  customerName: string;
  phone: string;
  ownerEmployeeId?: string | null;
};

export async function createLead(input: CreateLeadInput) {
  const res = await fetch("/api/admin/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

export async function deleteLead(id: string) {
  const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
  return parseOrThrow(res);
}

export async function transferLead(id: string, employeeId: string) {
  const res = await fetch(`/api/admin/leads/${id}/transfer`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId }),
  });
  return parseOrThrow(res);
}

export type UpdateLeadInput = {
  status: LeadStatus;
  note: string;
  nextFollowupDate?: string | null;
};

export async function updateLeadAdmin(id: string, input: UpdateLeadInput) {
  const res = await fetch(`/api/admin/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

export async function fetchSalesLeads(params: {
  q?: string;
  status?: LeadStatus | "";
  page?: number;
}): Promise<PaginatedResult<LeadListItem>> {
  const search = buildLeadSearch(params);
  const res = await fetch(`/api/sales/leads?${search.toString()}`);
  return parseOrThrow(res);
}

export async function fetchSalesLead(id: string): Promise<LeadDetail> {
  const res = await fetch(`/api/sales/leads/${id}`);
  return parseOrThrow(res);
}

export async function updateLeadSales(id: string, input: UpdateLeadInput) {
  const res = await fetch(`/api/sales/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

export async function pullLeadToOpenC(id: string) {
  const res = await fetch(`/api/admin/leads/${id}/pull-to-openc`, { method: "PATCH" });
  return parseOrThrow(res);
}

export type AdminOpenCListItem = {
  id: string;
  customerName: string;
  phone: string;
  status: LeadStatus;
  pulledToOpenAt: string | null;
  createdAt: string;
};

export type OpenCListItem = {
  id: string;
  customerName: string;
  status: LeadStatus;
  pulledToOpenAt: string | null;
  createdAt: string;
};

export async function fetchAdminOpenC(params: {
  q?: string;
  page?: number;
}): Promise<PaginatedResult<AdminOpenCListItem>> {
  const search = buildLeadSearch(params);
  const res = await fetch(`/api/admin/openc?${search.toString()}`);
  return parseOrThrow(res);
}

export async function fetchSalesOpenC(params: {
  q?: string;
  page?: number;
}): Promise<PaginatedResult<OpenCListItem>> {
  const search = buildLeadSearch(params);
  const res = await fetch(`/api/sales/openc?${search.toString()}`);
  return parseOrThrow(res);
}

export async function claimOpenCLead(id: string) {
  const res = await fetch(`/api/sales/openc/${id}/claim`, { method: "POST" });
  return parseOrThrow(res);
}

export type ImportAssignmentMode = "SINGLE_EMPLOYEE" | "ROUND_ROBIN" | "OPENC";

export type ImportRow = { customerName: string; phone: string };

export type LeadImportResult = {
  id: string;
  filename: string;
  totalRows: number;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  invalidCount: number;
  errorReport: { row: number; reason: string; raw: ImportRow }[] | null;
};

export async function importLeads(input: {
  filename: string;
  rows: ImportRow[];
  assignmentMode: ImportAssignmentMode;
  assignedEmployeeId?: string | null;
  employeeIds?: string[] | null;
}): Promise<LeadImportResult> {
  const res = await fetch("/api/admin/leads/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

export async function distributeLeads(employeeIds: string[]): Promise<{ distributedCount: number }> {
  const res = await fetch("/api/admin/leads/distribute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeIds }),
  });
  return parseOrThrow(res);
}
