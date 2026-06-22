import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "warning";
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "text-2xl font-semibold",
            tone === "warning" && Number(value) > 0 && "text-destructive"
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
