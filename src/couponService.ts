import { getCoupon } from "./couponStore";
import { InvalidCoupon } from "./types";

export interface DiscountResult {
  code: string;
  discountPercent: number;
}

export async function applyCoupon(code: string): Promise<DiscountResult> {
  const coupon = await getCoupon(code);

  if (!coupon.enabled) {
    throw new InvalidCoupon(`Coupon is disabled: ${code}`);
  }

  // BUG: checks a flag that doesn't exist on the type instead of comparing
  // expiresAt to the current time. Expired coupons are still accepted.
  if ((coupon as any).expired === true) {
    throw new InvalidCoupon(`Coupon is expired: ${code}`);
  }

  return {
    code: coupon.code,
    discountPercent: coupon.discountPercent,
  };
}
