import { requireRole } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
type DiscountType = "PERCENTAGE" | "FIXED";

export default async function AdminAcademyCouponsPage() {
  await requireRole(["ADMIN"]);

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { payments: true } },
    },
  });

  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
          <p className="text-sm text-muted-foreground">
            Discount codes ({coupons.length})
          </p>
        </div>
        <Button>
          <Plus className="size-4" />
          Add Coupon
        </Button>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Min Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No coupons found
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => {
                const isExpired =
                  coupon.expiresAt && coupon.expiresAt < now;
                const isMaxed =
                  coupon.maxUses !== null &&
                  coupon.usedCount >= coupon.maxUses;
                const isActive =
                  coupon.active && !isExpired && !isMaxed;

                return (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <span className="font-mono text-sm font-medium uppercase">
                        {coupon.code}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${Number(coupon.discount)}%`
                        : `$${Number(coupon.discount).toFixed(2)}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="font-medium">
                          {coupon.usedCount}
                        </span>
                        {coupon.maxUses && (
                          <span className="text-muted-foreground">
                            / {coupon.maxUses}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {coupon.minAmount
                        ? `$${Number(coupon.minAmount).toFixed(2)}`
                        : "No min"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          isActive ? "default" : "destructive"
                        }
                      >
                        {isActive
                          ? "Active"
                          : isExpired
                            ? "Expired"
                            : isMaxed
                              ? "Maxed"
                              : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {coupon.expiresAt
                        ? coupon.expiresAt.toLocaleDateString()
                        : "No expiry"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-xs">
                          <Pencil className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-destructive"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
