import { z } from "zod";

export const SELLER = {
  name: "ATELIER DU SNOWBOARD",
  legalForm: "SARL au capital de 1 000 EUR",
  address: "11 rue des Sagnes",
  city: "38860 Les Deux Alpes, France",
  siren: "528 566 094",
  siret: "528 566 094 00017",
  registration: "RCS Grenoble 528 566 094",
  vatNumber: "FR09528566094",
};

const addressSchema = z.object({
  name: z.string().min(1),
  lines: z.array(z.string().min(1)).min(2),
  country: z.literal("FR"),
});
export const invoiceSnapshotSchema = z.object({
  version: z.literal(1),
  seller: z.object(Object.fromEntries(Object.keys(SELLER).map(key => [key, z.string()])) as Record<keyof typeof SELLER, z.ZodString>),
  customer: addressSchema.extend({ email: z.string() }),
  shipping: addressSchema,
  orderId: z.uuid(),
  orderedAt: z.iso.datetime({ offset: true }),
  paidAt: z.iso.datetime({ offset: true }),
  paymentIntentId: z.string().startsWith("pi_"),
  currency: z.literal("eur"),
  vatRate: z.literal(20),
  lines: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().int().positive(),
    unitGross: z.number().int().nonnegative(),
    gross: z.number().int(),
    net: z.number().int(),
  })).min(1),
  totalGross: z.number().int().positive(),
  totalNet: z.number().int().nonnegative(),
  totalVat: z.number().int().nonnegative(),
});
export type InvoiceSnapshot = z.infer<typeof invoiceSnapshotSchema>;
export interface Invoice {
  id: string;
  order_id: string;
  number: string;
  issued_at: string;
  snapshot: InvoiceSnapshot;
  pdf_base64: string | null;
}

export class InvoiceError extends Error {}

export function cents(value: number): number {
  if (!Number.isFinite(value) || value < 0) throw new InvoiceError("Montant de commande invalide.");
  return Math.round((value + Number.EPSILON) * 100);
}

export function invoiceLines(
  items: { description: string; quantity: number; unitPrice: number; subtotal: number }[],
  shipping: number,
  discount: number,
  total: number,
) {
  cents(shipping);
  cents(discount);
  if (!items.length) throw new InvoiceError("Cette commande ne contient aucun article.");
  const lines = items.map(item => {
    const unitGross = cents(item.unitPrice);
    const gross = cents(item.subtotal);
    if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0 || unitGross * item.quantity !== gross) {
      throw new InvoiceError("Les montants des articles sont incohérents.");
    }
    return { description: item.description, quantity: item.quantity, unitGross, gross, net: Math.round(gross * 100 / 120) };
  });
  if (shipping > 0) {
    const gross = cents(shipping);
    lines.push({ description: "Frais de livraison", quantity: 1, unitGross: gross, gross, net: Math.round(gross * 100 / 120) });
  }
  if (discount > 0) {
    const gross = -cents(discount);
    lines.push({ description: "Remise commerciale", quantity: 1, unitGross: 0, gross, net: -Math.round(-gross * 100 / 120) });
  }
  const totalGross = lines.reduce((sum, line) => sum + line.gross, 0);
  if (totalGross !== cents(total) || totalGross <= 0) throw new InvoiceError("Le total de la commande est incohérent.");
  const totalNet = Math.round(totalGross * 100 / 120);
  // Répartir les centimes d'arrondi pour conserver une base HT globale exacte.
  // Le total des lignes reste égal au total HT, même sur une longue commande.
  let adjustment = totalNet - lines.reduce((sum, line) => sum + line.net, 0);
  const sorted = [...lines].sort((a, b) => {
    const aResidual = a.gross * 100 / 120 - a.net;
    const bResidual = b.gross * 100 / 120 - b.net;
    return adjustment > 0 ? bResidual - aResidual : aResidual - bResidual;
  });
  for (const line of sorted) {
    if (!adjustment) break;
    const cent = Math.sign(adjustment);
    line.net += cent;
    adjustment -= cent;
  }
  return { lines, totalGross, totalNet, totalVat: totalGross - totalNet };
}
