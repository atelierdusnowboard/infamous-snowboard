// Accepte la virgule française et le point, sans tronquer une saisie invalide.
export function parseEuroAmount(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) && Math.abs(value * 100 - Math.round(value * 100)) < 0.000001 ? value : NaN;
  }
  if (typeof value !== "string") return NaN;
  const text = value.trim().replace(/[\u00a0\u202f]/g, " ");
  if (!/^[+-]?(?:\d+|\d{1,3}(?: \d{3})+)(?:[.,]\d{1,2})?$/.test(text)) return NaN;
  const normalized = text.replace(/ /g, "").replace(",", ".");
  const result = Number(normalized);
  return Number.isFinite(result) && Number.isSafeInteger(Math.round(result * 100)) ? result : NaN;
}

export function cartSubtotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0) / 100;
}

export function checkoutAmounts(
  items: { price: number; quantity: number }[],
  promo?: { percentOff: number | null; amountOff: number | null } | null,
) {
  const subtotalCents = Math.round(cartSubtotal(items) * 100);
  const shippingCents = subtotalCents >= 30000 ? 0 : 1200;
  const beforeDiscount = subtotalCents + shippingCents;
  const discountCents = promo?.percentOff
    ? Math.min(beforeDiscount, Math.round(beforeDiscount * promo.percentOff / 100))
    : Math.min(beforeDiscount, Math.round((promo?.amountOff ?? 0) * 100));
  return { subtotal: subtotalCents / 100, shippingCost: shippingCents / 100,
    discountAmount: discountCents / 100, total: (beforeDiscount - discountCents) / 100 };
}
