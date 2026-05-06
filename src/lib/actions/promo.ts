"use server";

import { stripe } from "@/lib/stripe/server";

export type AppliedPromo = {
  id: string;
  code: string;
  percentOff: number | null;
  amountOff: number | null; // in EUR
};

export async function validatePromoCode(
  code: string
): Promise<AppliedPromo | { error: string }> {
  if (!code.trim()) {
    return { error: "Please enter a promo code" };
  }

  try {
    const promoCodes = await stripe.promotionCodes.list({
      code: code.trim().toUpperCase(),
      active: true,
      limit: 1,
      expand: ["data.promotion.coupon"],
    } as Parameters<typeof stripe.promotionCodes.list>[0]);

    const promoCode = promoCodes.data[0];
    if (!promoCode) {
      return { error: "Invalid or expired promo code" };
    }

    const coupon = promoCode.promotion.coupon;
    if (!coupon || typeof coupon === "string") {
      return { error: "Unable to retrieve promo code details" };
    }

    if (!coupon.valid) {
      return { error: "This promo code is no longer valid" };
    }

    return {
      id: promoCode.id,
      code: promoCode.code,
      percentOff: coupon.percent_off ?? null,
      amountOff: coupon.amount_off ? coupon.amount_off / 100 : null,
    };
  } catch {
    return { error: "Failed to validate promo code" };
  }
}
