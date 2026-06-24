import type { PaginatedResult } from "@/lib/api/leads";

export type ErrorLogItem = {
  id: string;
  message: string;
  stack: string | null;
  createdAt: string;
};

export async function fetchErrorLog(params: { page?: number }): Promise<PaginatedResult<ErrorLogItem>> {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  const res = await fetch(`/api/admin/errors?${search.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Request failed");
  return data;
}
