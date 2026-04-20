"use client";

import { Purchases } from "@revenuecat/purchases-js";

let purchasesInstance: Purchases | null = null;

export function configurePurchases(appUserId: string): Purchases {
  const apiKey =
    process.env.NEXT_PUBLIC_REVENUECAT_API_KEY ??
    "test_tEzxiCeRpktVaXbfsEUZZyZcQvN";

  if (!purchasesInstance) {
    purchasesInstance = Purchases.configure(apiKey, appUserId);
  }
  return purchasesInstance;
}

export function getPurchases(): Purchases | null {
  return purchasesInstance;
}

export function resetPurchases(): void {
  purchasesInstance = null;
}
