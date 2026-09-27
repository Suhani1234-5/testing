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

  return {
    code: coupon.code,
    discountPercent: coupon.discountPercent,
  };
}
