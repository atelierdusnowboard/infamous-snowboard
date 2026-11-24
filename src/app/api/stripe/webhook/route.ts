import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createServiceClient } from "@/lib/supabase/server";
import type Stripe from "stripe";
import { processCheckoutPayment } from "@/lib/invoices/automatic";
import { archivedInvoicePdf, issueOrderInvoice } from "@/lib/invoices/server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = createServiceClient();
    try {
      await processCheckoutPayment(event.type, session, {
        async confirmPayment(orderId, paymentIntentId) {
          const { data: order, error } = await supabase.from("orders")
            .update({ payment_intent_id: paymentIntentId, updated_at: new Date().toISOString() })
            .eq("id", orderId)
            .or(`payment_intent_id.is.null,payment_intent_id.eq.${paymentIntentId}`)
            .select("id, auto_invoice").single();
          if (error || !order) throw error ?? new Error("Commande introuvable.");
          // Les doublons de webhook ne doivent pas rétrograder une commande expédiée.
          const { error: statusError } = await supabase.from("orders")
            .update({ status: "confirmed", updated_at: new Date().toISOString() })
            .eq("id", orderId).eq("status", "pending");
          if (statusError) throw statusError;
          return { autoInvoice: order.auto_invoice === true };
        },
        async issueAndArchive(orderId) {
          await archivedInvoicePdf(await issueOrderInvoice(orderId));
        },
        async recordError(orderId, message) {
          const { error } = await supabase.from("orders").update({ invoice_error: message }).eq("id", orderId);
          if (error) throw error;
        },
      });
    } catch (error) {
      console.error("[stripe] Traitement du paiement ou de la facture impossible", error);
      return NextResponse.json({ error: "Payment processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
