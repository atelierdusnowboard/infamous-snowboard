import type Stripe from "stripe";
import { z } from "zod";
import { InvoiceError } from "./model";

interface AutomaticInvoiceDependencies {
  confirmPayment: (orderId: string, paymentIntentId: string) => Promise<{ autoInvoice: boolean }>;
  issueAndArchive: (orderId: string) => Promise<void>;
  recordError: (orderId: string, message: string | null) => Promise<void>;
}

// Appelé uniquement après vérification de la signature Stripe.
export async function processCheckoutPayment(
  eventType: string,
  session: Stripe.Checkout.Session,
  dependencies: AutomaticInvoiceDependencies,
): Promise<void> {
  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(eventType)
    || session.payment_status !== "paid") return;

  const orderId = z.uuid().parse(session.metadata?.orderId);
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!paymentIntentId || !/^pi_[a-zA-Z0-9]+$/.test(paymentIntentId)) throw new Error("Référence de paiement manquante.");
  const { autoInvoice } = await dependencies.confirmPayment(orderId, paymentIntentId);
  if (!autoInvoice) return;

  try {
    await dependencies.issueAndArchive(orderId);
    await dependencies.recordError(orderId, null);
  } catch (error) {
    await dependencies.recordError(orderId, error instanceof InvoiceError
      ? error.message
      : "Émission automatique interrompue. Une nouvelle tentative sera effectuée par Stripe ; vous pouvez aussi réessayer manuellement.");
    // Une panne technique doit être réessayée par Stripe. Une vente hors périmètre
    // est signalée à l'admin sans faire réessayer inutilement le webhook.
    if (!(error instanceof InvoiceError)) throw error;
  }
}
