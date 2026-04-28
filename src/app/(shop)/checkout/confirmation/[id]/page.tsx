import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/queries/orders";
import { formatBoardSize, formatPrice, formatDate } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false, follow: false },
};

interface ConfirmationPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

export default async function ConfirmationPage({
  params,
  searchParams,
}: ConfirmationPageProps) {
  const { id } = await params;
  const { session_id } = await searchParams;

  let order = null;
  try {
    order = await getOrderById(id);
  } catch {
    notFound();
  }

  if (!order) notFound();

  const isPaid =
    order.status === "confirmed" ||
    order.status === "processing" ||
    order.status === "shipped" ||
    order.status === "delivered";

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="border-b border-black pb-8 mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-4">
            {isPaid ? "Commande confirmée" : "Order received"}
          </p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest leading-tight">
            {isPaid ? (
              <>
                COMMANDE
                <br />
                CONFIRMÉE.
              </>
            ) : (
              <>
                Your Order Is In.
                <br />
                Gear Up.
              </>
            )}
          </h1>
          {session_id && isPaid && (
            <p className="text-xs text-black/40 mt-4 uppercase tracking-widest">
              Paiement validé par Stripe.
            </p>
          )}
        </div>

        {/* Order info */}
        <div className="space-y-6">
          <div className="border border-black">
            <div className="px-4 py-3 border-b border-black bg-black text-white">
              <p className="text-xs font-bold uppercase tracking-widest">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <div className="px-4 py-4 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-black/40 uppercase tracking-widest">Date</span>
                <span className="font-bold">{formatDate(order.created_at)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-black/40 uppercase tracking-widest">Status</span>
                <span className="font-bold uppercase">{order.status}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-black pt-3">
                <span className="font-bold uppercase tracking-widest">Total</span>
                <span className="font-black">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border border-black">
            <div className="px-4 py-3 border-b border-black">
              <h3 className="text-xs font-bold uppercase tracking-widest">
                Items Ordered
              </h3>
            </div>
            {order.order_items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between px-4 py-3 border-b border-black last:border-b-0"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest">
                    {item.product_name}
                  </p>
                  {item.size_cm && (
                    <p className="text-xs text-black/40 mt-0.5">
                      {formatBoardSize(item.size_cm, item.is_wide)} cm
                    </p>
                  )}
                </div>
                <p className="text-xs font-bold">{formatPrice(item.subtotal)}</p>
              </div>
            ))}
          </div>

          {/* Shipping */}
          <div className="border border-black px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-widest mb-3">
              Ships To
            </p>
            <p className="text-sm">{order.shipping_name}</p>
            <p className="text-sm text-black/60">{order.shipping_address}</p>
            <p className="text-sm text-black/60">
              {order.shipping_city}, {order.shipping_postal_code}
            </p>
            <p className="text-sm text-black/60">{order.shipping_country}</p>
          </div>

          {/* Payment status */}
          <div
            className={`border px-4 py-4 ${
              isPaid ? "border-black bg-black text-white" : "border-black bg-black/5"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-widest">
              {isPaid
                ? "Paiement confirmé. Votre commande est en cours de traitement."
                : "Paiement en attente."}
            </p>
          </div>

          <div className="flex gap-4">
            <Link href="/account/orders" className="flex-1">
              <Button variant="outline" size="md" className="w-full">
                View Orders
              </Button>
            </Link>
            <Link href="/shop" className="flex-1">
              <Button size="md" className="w-full">
                Keep Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
