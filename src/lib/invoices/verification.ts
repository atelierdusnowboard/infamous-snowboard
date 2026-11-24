import type Stripe from "stripe";
import { cents, InvoiceError } from "./model";

export function verifyInvoicePayment(payment: Stripe.PaymentIntent, total: number): Stripe.Charge {
  const charge = typeof payment.latest_charge === "object" ? payment.latest_charge : null;
  if (payment.status !== "succeeded" || payment.currency !== "eur" || payment.amount_received !== cents(total)
    || !charge || !charge.paid || charge.amount_refunded > 0 || charge.disputed) {
    throw new InvoiceError("Le paiement est incomplet, remboursé, contesté ou différent du total de la commande. Vérification comptable nécessaire.");
  }
  return charge;
}

export function verifyFrenchSale(billingCountry: string | null | undefined, shippingCountry: string) {
  if (billingCountry !== "FR" || !["FR", "FRANCE"].includes(shippingCountry.trim().toUpperCase())) {
    throw new InvoiceError("La facturation à 20 % est disponible pour les ventes en France. Cette vente nécessite une vérification du régime de TVA.");
  }
}

export function verifyPaidLines(
  expected: { name: string; quantity: number; subtotal: number }[],
  paid: Pick<Stripe.LineItem, "description" | "quantity" | "amount_subtotal">[],
  hasMore: boolean,
) {
  const remaining = [...paid];
  for (const item of expected) {
    const index = remaining.findIndex(line => line.description === item.name && line.quantity === item.quantity && line.amount_subtotal === item.subtotal);
    if (index < 0) throw new InvoiceError("Les articles payés ne correspondent pas à la commande.");
    remaining.splice(index, 1);
  }
  if (hasMore || remaining.length) throw new InvoiceError("Les articles payés ne correspondent pas à la commande.");
}
