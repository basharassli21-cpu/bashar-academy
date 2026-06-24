import { requireRole } from "@/lib/auth/dal";

export default async function AdminAcademyPaymentsPage() {
  await requireRole(["ADMIN"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground">
          All courses are free — no payment processing is needed.
        </p>
      </div>
    </div>
  );
}
