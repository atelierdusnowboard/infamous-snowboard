import type { Metadata } from "next";
import Link from "next/link";
import { getAllOrders } from "@/lib/queries/orders";
import { formatPrice, formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import type { OrderWithItems } from "@/lib/queries/orders";

export const metadata: Metadata = {
  title: "Admin — Orders",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage() {
  let orders: OrderWithItems[] = [];
  try {
    orders = await getAllOrders();
  } catch {
    // DB not configured
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-widest">
          Orders
        </h1>
      </div>

      <div className="border border-black">
        <div className="grid grid-cols-5 px-4 py-3 border-b border-black bg-black text-white text-xs font-bold uppercase tracking-widest">
          <span>Order</span>
          <span>Customer</span>
          <span>Date</span>
          <span>Total</span>
          <span>Status</span>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xs text-black/40 uppercase tracking-widest">
              No orders yet.
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="grid grid-cols-5 px-4 py-4 border-b border-black last:border-b-0 hover:bg-black/5 transition-colors items-center"
            >
              <span className="text-xs font-mono">
                #{order.id.slice(0, 8).toUpperCase()}
              </span>
              <div>
                <p className="text-xs font-bold">{order.shipping_name}</p>
                <p className="text-xs text-black/40">{order.shipping_email}</p>
              </div>
              <span className="text-xs">{formatDate(order.created_at)}</span>
              <span className="text-xs font-bold">
                {formatPrice(order.total)}
              </span>
              <Badge variant="outline">{order.status}</Badge>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
