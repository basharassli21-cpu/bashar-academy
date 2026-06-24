import type { LeadStatus } from "@/lib/api/leads";

export type WorkQueueItem = {
  id: string;
  customerName: string;
  phone: string;
  status: LeadStatus;
  lastContactDate: string | null;
  nextFollowupDate: string | null;
  tags: string[];
};

async function parseOrThrow(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Request failed");
  return data;
}

export async function fetchSalesWorkQueue(): Promise<{ items: WorkQueueItem[] }> {
  const res = await fetch("/api/sales/leads/queue");
  return parseOrThrow(res);
}
