import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/components/providers/locale-provider";
import type { LeadStatus } from "@/lib/api/leads";

const STATUS_VARIANT: Record<LeadStatus, "default" | "secondary" | "outline" | "destructive"> = {
  NEW: "outline",
  CONTACTED: "secondary",
  INTERESTED: "default",
  NOT_INTERESTED: "secondary",
  CLOSED_SALE: "default",
  CANCELLED: "destructive",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const t = useTranslations();
  return <Badge variant={STATUS_VARIANT[status]}>{t.status[status]}</Badge>;
}
