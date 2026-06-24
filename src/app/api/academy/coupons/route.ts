import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponseBody, ValidationError } from "@/lib/errors";
import { z } from "zod";

const validateCouponSchema = z.object({
  code: z.string().min(1),
  amount: z.number().min(0).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = validateCouponSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
    const { code, amount } = parsed.data;

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon) throw new ValidationError("Invalid coupon code");
    if (!coupon.active) throw new ValidationError("Coupon is no longer active");
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new ValidationError("Coupon has expired");
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new ValidationError("Coupon has reached its usage limit");
    if (amount !== undefined && coupon.minAmount && amount < Number(coupon.minAmount)) {
      throw new ValidationError(`Minimum purchase amount is ${coupon.minAmount}`);
    }

    return NextResponse.json({
      valid: true,
      discount: coupon.discount,
      discountType: coupon.discountType,
      code: coupon.code,
    });
  } catch (error) {
    const { message, status } = errorResponseBody(error);
    return NextResponse.json({ message }, { status });
  }
}
