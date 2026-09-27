export interface Coupon {
  code: string;
  discountPercent: number;
  enabled: boolean;
  expiresAt: Date | null;
}

export class InvalidCoupon extends Error {}
export class ExpiredCoupon extends Error {}
