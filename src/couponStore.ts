import { Coupon } from "./types";

// In-memory store so tests never need a real database.
const coupons: Record<string, Coupon> = {
  SAVE10: {
    code: "SAVE10",
    discountPercent: 10,
    enabled: true,
    expiresAt: null,
  },
  EXPIRED20: {
    code: "EXPIRED20",
    discountPercent: 20,
    enabled: true,
    expiresAt: new Date("2020-01-01T00:00:00.000Z"),
  },
  DISABLED15: {
    code: "DISABLED15",
    discountPercent: 15,
    enabled: false,
    expiresAt: null,
  },
  FUTURE25: {
    code: "FUTURE25",
    discountPercent: 25,
    enabled: true,
    expiresAt: new Date("2099-01-01T00:00:00.000Z"),
  },
};

export async function getCoupon(code: string): Promise<Coupon> {
  const coupon = coupons[code];
  if (!coupon) {
    throw new Error(`Coupon not found: ${code}`);
  }
  return coupon;
}
