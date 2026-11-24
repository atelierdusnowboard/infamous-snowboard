import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";
import { invoiceLines, invoiceSnapshotSchema, SELLER, type Invoice } from "../src/lib/invoices/model";
import { renderInvoicePdf } from "../src/lib/invoices/pdf";
import { invoiceCsv } from "../src/lib/invoices/export";
import { verifyInvoicePayment, verifyFrenchSale, verifyPaidLines } from "../src/lib/invoices/verification";
import type Stripe from "stripe";
import { parseEuroAmount, cartSubtotal, checkoutAmounts } from "../src/lib/utils/money";
import { formatPrice } from "../src/lib/utils/format";

const item = { description: "Infamous Édition spéciale - 156", quantity: 2, unitPrice: 199.99, subtotal: 399.98 };

test("les saisies françaises et décimales conservent exactement les centimes", () => {
  for (const value of ["199,90", "199.90", " 199,90 "]) assert.equal(parseEuroAmount(value), 199.9);
  assert.equal(parseEuroAmount("1 299,90"), 1299.9);
  assert.equal(parseEuroAmount("1\u202f299,90"), 1299.9);
  assert.equal(parseEuroAmount("-12,50"), -12.5);
  for (const value of ["", null, "199,999", "199,90.00", "1 2,50", "abc", "1e3"]) {
    assert.ok(Number.isNaN(parseEuroAmount(value)), String(value));
  }
  assert.match(formatPrice(199.9), /^199,90/);
});

test("le panier et le paiement calculent les mêmes centimes, même à la limite de livraison offerte", () => {
  assert.equal(cartSubtotal([{ price: 0.1, quantity: 1 }, { price: 0.2, quantity: 1 }]), 0.3);
  const items = [{ price: 99.99, quantity: 3 }, { price: 0.03, quantity: 1 }];
  const result = checkoutAmounts(items, { percentOff: 12.5, amountOff: null });
  assert.equal(result.subtotal, 300);
  assert.equal(result.shippingCost, 0);
  assert.equal(result.discountAmount, 37.5);
  assert.equal(result.total, 262.5);
});

test("le total du panier suit immédiatement l'ajout, la quantité, la suppression et la restauration", async () => {
  const saved = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => saved.set(key, value),
    removeItem: (key: string) => saved.delete(key),
  } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: globalThis.localStorage } });
  const { useCartStore: store } = await import("../src/lib/store/cart");
  store.getState().clearCart();
  store.getState().addItem({ productId: "product", variantId: "variant", name: "Board", slug: "board", price: 199.9, size: "156", image: null, quantity: 1 });
  assert.equal(store.getState().total, 199.9);
  store.getState().updateQty("variant", 3);
  assert.equal(store.getState().total, 599.7);
  assert.equal(store.getState().count, 3);
  store.getState().removeItem("variant");
  assert.equal(store.getState().total, 0);
  saved.set("infamous-cart", JSON.stringify({ state: { items: [{ productId: "p", variantId: "v", price: 19.9, quantity: 2 }], total: 0, count: 0 }, version: 0 }));
  await store.persist.rehydrate();
  assert.equal(store.getState().total, 39.8);
  assert.equal(store.getState().count, 2);
  store.getState().clearCart();
});
const fixture = (many = false): Invoice => ({
  id: "00000000-0000-4000-8000-000000000001", order_id: "00000000-0000-4000-8000-000000000002",
  number: "INF-000001", issued_at: "2026-11-24T13:00:00Z", pdf_base64: null,
  snapshot: invoiceSnapshotSchema.parse({
    version: 1, seller: SELLER, orderId: "00000000-0000-4000-8000-000000000002", orderedAt: "2026-10-20T10:00:00Z",
    paidAt: "2026-10-20T10:05:00Z", paymentIntentId: "pi_example", currency: "eur", vatRate: 20,
    customer: { name: "Élodie François", email: "exemple@example.com", country: "FR", lines: ["25 avenue de la République", "75011 Paris"] },
    shipping: { name: "Élodie François", country: "FR", lines: ["11 rue des Sagnes", "38860 Les Deux Alpes"] },
    ...invoiceLines(many ? Array.from({ length: 65 }, (_, i) => ({ ...item, description: `${i + 1}. ${item.description} ${"Description longue et référence produit. ".repeat(3)}` })) : [item],
      12, 41.20, many ? 65 * 399.98 + 12 - 41.20 : 370.78),
  }),
});

test("TVA, remise et livraison sont calculées en centimes sans perdre le TTC payé", () => {
  const totals = invoiceLines([item], 12, 41.20, 370.78);
  assert.equal(totals.totalGross, 37078);
  assert.equal(totals.totalNet + totals.totalVat, 37078);
  assert.equal(totals.lines.at(-1)?.gross, -4120);
  assert.equal(totals.lines.reduce((sum, line) => sum + line.net, 0), totals.totalNet);
});

test("une commande gratuite, incohérente, vide ou une quantité incorrecte est refusée", () => {
  assert.throws(() => invoiceLines([item], 0, 0, 400));
  assert.throws(() => invoiceLines([item], 0, 399.98, 0));
  assert.throws(() => invoiceLines([], 12, 0, 12));
  assert.throws(() => invoiceLines([{ ...item, quantity: 1.5 }], 0, 0, 399.98));
  assert.throws(() => invoiceLines([{ ...item, unitPrice: -1 }], 0, 0, 399.98));
  assert.throws(() => invoiceLines([item], -12, 0, 399.98));
});

test("les arrondis de nombreuses lignes restent cohérents avec la TVA globale", () => {
  const totals = invoiceLines(Array.from({ length: 65 }, () => item), 12, 41.20, 65 * 399.98 + 12 - 41.20);
  assert.equal(totals.totalNet, Math.round(totals.totalGross / 1.2));
  assert.equal(totals.lines.reduce((sum, line) => sum + line.net, 0), totals.totalNet);
});

test("les instantanés refusent les devises, pays et taux non pris en charge", () => {
  const snapshot = fixture().snapshot;
  assert.equal(invoiceSnapshotSchema.safeParse({ ...snapshot, currency: "usd" }).success, false);
  assert.equal(invoiceSnapshotSchema.safeParse({ ...snapshot, vatRate: 0 }).success, false);
  assert.equal(invoiceSnapshotSchema.safeParse({ ...snapshot, shipping: { ...snapshot.shipping, country: "CH" } }).success, false);
});

test("seul un paiement effectivement encaissé, non remboursé et non contesté est accepté", () => {
  const payment = { status: "succeeded", currency: "eur", amount_received: 12000,
    latest_charge: { paid: true, amount_refunded: 0, disputed: false } } as Stripe.PaymentIntent;
  assert.equal(verifyInvoicePayment(payment, 120), payment.latest_charge);
  assert.throws(() => verifyInvoicePayment({ ...payment, status: "processing" }, 120));
  assert.throws(() => verifyInvoicePayment({ ...payment, currency: "usd" }, 120));
  assert.throws(() => verifyInvoicePayment(payment, 121));
  assert.throws(() => verifyInvoicePayment({ ...payment, latest_charge: null }, 120));
  const charge = payment.latest_charge as Stripe.Charge;
  assert.throws(() => verifyInvoicePayment({ ...payment, latest_charge: { ...charge, amount_refunded: 1 } }, 120));
  assert.throws(() => verifyInvoicePayment({ ...payment, latest_charge: { ...charge, disputed: true } }, 120));
});

test("les ventes hors France et les articles différents du paiement sont refusés", () => {
  assert.doesNotThrow(() => verifyFrenchSale("FR", "France"));
  assert.throws(() => verifyFrenchSale("FR", "CH"));
  assert.throws(() => verifyFrenchSale("BE", "FR"));
  assert.throws(() => verifyFrenchSale(null, "FR"));
  const expected = [{ name: "Board", quantity: 2, subtotal: 12000 }];
  const paid = [{ description: "Board", quantity: 2, amount_subtotal: 12000 }];
  assert.doesNotThrow(() => verifyPaidLines(expected, paid, false));
  assert.throws(() => verifyPaidLines(expected, [{ ...paid[0], quantity: 1 }], false));
  assert.throws(() => verifyPaidLines(expected, [{ ...paid[0], amount_subtotal: 11900 }], false));
  assert.throws(() => verifyPaidLines(expected, [...paid, ...paid], false));
  assert.throws(() => verifyPaidLines(expected, paid, true));
});

test("l'export comptable conserve les montants et neutralise les formules CSV", () => {
  const invoice = fixture();
  invoice.snapshot.customer.name = '=HYPERLINK("https://example.com")';
  const csv = invoiceCsv([invoice]);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes('"370,78"'));
  assert.ok(csv.includes('"\'=HYPERLINK(""https://example.com"")"'));
  assert.ok(csv.includes("20/10/2026"));
});

test("les PDF simple et multipage se génèrent avec les accents et les métadonnées", async () => {
  const dir = "/tmp/infamous-invoice-preview";
  await mkdir(dir, { recursive: true });
  for (const many of [false, true]) {
    const pdf = await renderInvoicePdf(fixture(many));
    const parsed = await PDFDocument.load(pdf);
    assert.equal(parsed.getTitle(), "Facture INF-000001 - Infamous");
    assert.ok(many ? parsed.getPageCount() > 2 : parsed.getPageCount() === 1);
    await writeFile(`${dir}/${many ? "multipage" : "simple"}.pdf`, pdf);
  }
});
