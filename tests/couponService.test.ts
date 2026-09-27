import { applyCoupon } from "../src/couponService";
import { InvalidCoupon } from "../src/types";

describe("applyCoupon", () => {
  it("applies an active coupon", async () => {
    const result = await applyCoupon("SAVE10");
    expect(result.discountPercent).toBe(10);
  });

  it("rejects a disabled coupon", async () => {
    await expect(applyCoupon("DISABLED15")).rejects.toThrow(InvalidCoupon);
  });

  it("throws for an unknown coupon code", async () => {
    await expect(applyCoupon("DOES_NOT_EXIST")).rejects.toThrow();
  });
});
