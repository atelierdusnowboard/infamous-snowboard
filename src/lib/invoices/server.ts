import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { cents, invoiceLines, invoiceSnapshotSchema, InvoiceError, SELLER, type Invoice } from "./model";
import { renderInvoicePdf } from "./pdf";
import { verifyFrenchSale, verifyInvoicePayment, verifyPaidLines } from "./verification";

export async function getOrderInvoice(orderId: string): Promise<Invoice | null> {
  const client = await createClient();
  const { data, error } = await client.from("invoices").select("id, order_id, number, issued_at, snapshot").eq("order_id", orderId).maybeSingle();
  if (error) throw new Error("Les factures sont indisponibles. Vérifiez la migration 0011.");
  return data ? { ...data, snapshot: invoiceSnapshotSchema.parse(data.snapshot), pdf_base64: null } as Invoice : null;
}

// Appel réservé à une action admin authentifiée ou à un webhook Stripe signé.
export async function issueOrderInvoice(orderId: string): Promise<Invoice> {
  const db = createServiceClient();
  const { data: existing, error: readError } = await db.from("invoices").select("*").eq("order_id", orderId).maybeSingle();
  if (readError) throw readError;
  if (existing) return existing as Invoice;
  const { data: order, error } = await db.from("orders").select("*, order_items(*)").eq("id", orderId).single();
  if (error || !order) throw new InvoiceError("Commande introuvable.");
  if (!order.payment_intent_id || ["pending", "cancelled"].includes(order.status)) {
    throw new InvoiceError("Cette commande ne possède pas de paiement confirmé exploitable.");
  }
  const stripe = getStripe();
  const payment = await stripe.paymentIntents.retrieve(order.payment_intent_id, { expand: ["latest_charge"] });
  const charge = verifyInvoicePayment(payment, order.total);
  const sessions = await stripe.checkout.sessions.list({ payment_intent: payment.id, limit: 100 });
  const session = sessions.data.find(s => s.metadata?.orderId === orderId && s.payment_status === "paid");
  if (!session || session.currency !== "eur" || session.amount_total !== cents(order.total)) {
    throw new InvoiceError("Impossible de rapprocher cette commande de son paiement Stripe.");
  }
  const billing = session.customer_details;
  const address = billing?.address;
  const shipping = session.collected_information?.shipping_details;
  const shippingCountry = shipping?.address?.country ?? order.shipping_country;
  verifyFrenchSale(address?.country, shippingCountry);
  if (!billing?.name || !address?.line1 || !address.postal_code || !address.city) {
    throw new InvoiceError("L’adresse de facturation du paiement est incomplète.");
  }
  const discount = order.discount_amount ?? 0;
  if (session.amount_subtotal !== cents(order.subtotal) + cents(order.shipping_cost)
    || (session.total_details?.amount_discount ?? 0) !== cents(discount)
    || (session.total_details?.amount_tax ?? 0) !== 0) {
    throw new InvoiceError("Les remises ou les montants Stripe ne correspondent pas à la commande.");
  }
  // Les lignes payées doivent correspondre aux lignes conservées dans la commande.
  const paidLines = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
  const expected = order.order_items.map((item: { product_name: string; size: string | null; quantity: number; subtotal: number }) => ({
    name: item.size ? `${item.product_name} — ${item.size}` : item.product_name,
    quantity: item.quantity, subtotal: cents(item.subtotal),
  }));
  if (order.shipping_cost > 0) expected.push({ name: "Shipping", quantity: 1, subtotal: cents(order.shipping_cost) });
  verifyPaidLines(expected, paidLines.data, paidLines.has_more);
  const totals = invoiceLines(order.order_items.map((item: { product_name: string; size: string | null; quantity: number; unit_price: number; subtotal: number }) => ({
    description: item.size ? `${item.product_name} - ${item.size}` : item.product_name,
    quantity: item.quantity, unitPrice: item.unit_price, subtotal: item.subtotal,
  })), order.shipping_cost, discount, order.total);
  const snapshot = invoiceSnapshotSchema.parse({
    version: 1, seller: SELLER,
    customer: { name: billing.name, email: billing.email ?? order.shipping_email, country: "FR",
      lines: [address.line1, address.line2, `${address.postal_code} ${address.city}`].filter(Boolean) },
    shipping: { name: shipping?.name ?? order.shipping_name, country: "FR",
      lines: shipping?.address?.line1
        ? [shipping.address.line1, shipping.address.line2, `${shipping.address.postal_code ?? ""} ${shipping.address.city ?? ""}`.trim()].filter(Boolean)
        : [order.shipping_address, `${order.shipping_postal_code} ${order.shipping_city}`] },
    orderId, orderedAt: order.created_at, paidAt: new Date(charge.created * 1000).toISOString(),
    paymentIntentId: payment.id, currency: "eur", vatRate: 20, ...totals,
  });
  // Valider le rendu et les caractères avant d'attribuer un numéro définitif.
  try {
    await renderInvoicePdf({ id: "preview", order_id: orderId, number: "APERÇU", issued_at: new Date().toISOString(), snapshot, pdf_base64: null });
  } catch {
    throw new InvoiceError("Le document contient un caractère non pris en charge ou ne peut pas être rendu. Aucune facture n’a été émise.");
  }
  const { data: invoice, error: issueError } = await db.rpc("issue_invoice", { p_order_id: orderId, p_snapshot: snapshot });
  if (issueError) throw issueError;
  return invoice as Invoice;
}

export async function archivedInvoicePdf(invoice: Invoice): Promise<Uint8Array> {
  if (invoice.pdf_base64) return Buffer.from(invoice.pdf_base64, "base64");
  const pdf = await renderInvoicePdf({ ...invoice, snapshot: invoiceSnapshotSchema.parse(invoice.snapshot) });
  const db = createServiceClient();
  const { error } = await db.from("invoices").update({ pdf_base64: Buffer.from(pdf).toString("base64") }).eq("id", invoice.id).is("pdf_base64", null);
  if (error) throw error;
  // Un téléchargement concurrent peut avoir archivé le même document en premier.
  const { data, error: readError } = await db.from("invoices").select("pdf_base64").eq("id", invoice.id).single();
  if (readError || !data?.pdf_base64) throw new Error("Archivage de la facture impossible.");
  return Buffer.from(data.pdf_base64, "base64");
}
