import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/lib/queries/orders";
import { OrderDetail } from "@/components/account/OrderDetail";
import { OrderStatusPanel } from "@/components/admin/OrderStatusPanel";
import { getOrderInvoice } from "@/lib/invoices/server";
import { issueInvoiceAction } from "@/lib/actions/invoices";

export const metadata: Metadata = {
  title: "Admin — Order Detail",
  robots: { index: false, follow: false },
};

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ invoiceError?: string }>;
}


export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  const { invoiceError } = await searchParams;

  let order = null;
  try {
    order = await getOrderById(id);
  } catch {
    notFound();
  }

  if (!order) notFound();
  let invoice = null;
  let invoicesAvailable = true;
  try {
    invoice = await getOrderInvoice(id);
  } catch {
    invoicesAvailable = false;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/orders"
          className="text-xs text-black/40 uppercase tracking-widest hover:text-black transition-colors"
        >
          &larr; Orders
        </Link>
        <h1 className="text-2xl font-black uppercase tracking-widest">
          Order Detail
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <OrderDetail order={order} />
        </div>

        <div>
          <OrderStatusPanel orderId={id} initialStatus={order.status} />
          <section className="mt-6 border border-black p-4 space-y-4" aria-labelledby="invoice-heading">
            <h2 id="invoice-heading" className="text-xs font-bold uppercase tracking-widest">Facture</h2>
            {invoiceError && <p role="alert" className="text-sm text-red-700">{invoiceError}</p>}
            {order.invoice_error && <p role="alert" className="text-sm text-red-700">Facturation automatique : {order.invoice_error}</p>}
            {!invoicesAvailable ? (
              <p className="text-sm">La facturation sera disponible après l’installation de la mise à jour de la base de données.</p>
            ) : invoice ? (
              <>
                <p className="text-sm">Facture {invoice.number}</p>
                <a href={`/api/admin/orders/${id}/invoice`} className="block bg-black text-white p-3 text-center text-xs font-bold uppercase tracking-widest">
                  Télécharger le PDF
                </a>
              </>
            ) : order.payment_intent_id && !["pending", "cancelled"].includes(order.status) ? (
              <form action={issueInvoiceAction} className="space-y-4">
                <input type="hidden" name="orderId" value={id} />
                <p className="text-sm">Émettre une facture acquittée au nom d’Atelier du Snowboard, avec une TVA de 20 %, après vérification du paiement.</p>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" name="noPreviousInvoice" required className="mt-1" />
                  Cette vente n’a pas déjà été facturée dans un autre outil.
                </label>
                <button type="submit" className="w-full bg-black text-white p-3 text-xs font-bold uppercase tracking-widest">Émettre la facture</button>
              </form>
            ) : <p className="text-sm">Une facture peut être émise après confirmation du paiement.</p>}
            <Link href="/admin/invoices" className="block text-xs underline">Toutes les factures et export comptable</Link>
          </section>
        </div>
      </div>
    </div>
  );
}
