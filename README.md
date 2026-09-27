# proofpr-test-repo

A minimal, isolated Node/TypeScript repo built specifically to test ProofPR's
Reproducer Agent end-to-end. No database, no external APIs, no `.env` needed —
`npm install && npm test` just works.

## What's here

`src/couponService.ts` on `main` only checks `coupon.enabled`. It does **not**
check `coupon.expiresAt` at all — expired coupons are silently accepted.

The PR you'll open (`feature/coupon-expiry-validation`) is meant to represent a
contributor's attempt to fix that. Two variants are given below:

- **Variant A — buggy fix** → should end in `PROVEN` → `PROVEN FIXED` after your
  Fixer/Verifier agents run.
- **Variant B — false positive** → use this to test the `REJECTED` path.

---

## Step-by-step: push this repo and open the PR

```bash
cd proofpr-test-repo
git init
git add .
git commit -m "Initial coupon service (no expiry validation)"
git branch -M main

# create a new EMPTY repo on GitHub first (via github.com/new), then:
git remote add origin https://github.com/<your-username>/proofpr-test-repo.git
git push -u origin main
```

### Now create the PR branch (Variant A — the real, reproducible bug)

```bash
git checkout -b feature/coupon-expiry-validation
```

Replace the contents of `src/couponService.ts` with:

```ts
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
```

Then commit and push:

```bash
git add .
git commit -m "Add coupon expiration validation"
git push -u origin feature/coupon-expiry-validation
```

Open a PR on GitHub: `feature/coupon-expiry-validation` → `main`, with description:

> Adds validation so expired coupons are rejected at checkout.

**Expected ProofPR result:** Investigator flags "expired coupons may be
accepted" → Reproducer writes a test using the `EXPIRED20` coupon from
`couponStore.ts` → test fails (bug confirmed) → status `PROVEN` → Fixer
proposes comparing `coupon.expiresAt < new Date()` → Adversarial Verifier
checks `EXPIRED20`, `FUTURE25`, `SAVE10` (null expiry), `DISABLED15` → all
pass → Regression suite (the 3 existing tests) stays green → `PROVEN FIXED`.

---

### Optional: Variant B (false-positive, tests the REJECTED path)

Make a second branch `feature/false-positive-null-check` off `main` where you
only touch an unrelated file (e.g. add a comment to `couponStore.ts`) but
write a PR description that *claims* "fixes a null pointer risk in
`getCoupon`". Since `getCoupon` already throws a clear error for unknown
codes (see the third existing test), your Investigator may flag a "possible
null return" concern that the Reproducer should then fail to reproduce —
exercising the `REJECTED` / `UNVERIFIED` path.

---

## Sanity check before pointing ProofPR at it

```bash
npm install
npm test
```

You should see 3 passing tests on `main`, and the same 3 tests still pass on
the PR branch (the bug is about a *missing* rejection, not a crash — so
existing tests won't catch it, which is exactly why this is a good
demonstration case for ProofPR).
