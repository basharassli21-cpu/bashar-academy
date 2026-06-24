"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useTranslations } from "@/components/providers/locale-provider";
import type { LeadStatus } from "@/lib/api/leads";
import type { StatusBreakdownItem } from "@/lib/api/dashboard";

const STATUS_HEX: Record<LeadStatus, string> = {
  NEW: "#3b82f6",
  CONTACTED: "#f97316",
  INTERESTED: "#22c55e",
  NOT_INTERESTED: "#ef4444",
  CLOSED_SALE: "#047857",
  CANCELLED: "#6b7280",
};

export function PipelineFunnel({ data }: { data: StatusBreakdownItem[] }) {
  const t = useTranslations();
  const chartData = data.map((item) => ({ ...item, label: t.status[item.status] }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.pipeline.title}</CardTitle>
        <CardDescription>{t.pipeline.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div dir="ltr" className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 0 }}>
              <XAxis type="number" allowDecimals={false} stroke="#888888" fontSize={12} />
              <YAxis
                type="category"
                dataKey="label"
                width={110}
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip cursor={{ fill: "rgba(128,128,128,0.1)" }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={32} isAnimationActive={false}>
                {chartData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_HEX[entry.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
