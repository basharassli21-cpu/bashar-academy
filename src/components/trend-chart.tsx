"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import type { TrendPoint } from "@/lib/api/dashboard";

function formatShortDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TrendChart({
  title,
  description,
  data,
  primaryLabel,
  secondaryLabel,
}: {
  title: string;
  description: string;
  data: TrendPoint[];
  primaryLabel: string;
  secondaryLabel: string;
}) {
  const chartData = data.map((p) => ({ ...p, label: formatShortDate(p.date) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
            {primaryLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: "#047857" }} />
            {secondaryLabel}
          </span>
        </div>
        <div dir="ltr" className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <XAxis dataKey="label" stroke="#888888" fontSize={12} minTickGap={16} />
              <YAxis allowDecimals={false} stroke="#888888" fontSize={12} width={32} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="primary"
                name={primaryLabel}
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="secondary"
                name={secondaryLabel}
                stroke="#047857"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
