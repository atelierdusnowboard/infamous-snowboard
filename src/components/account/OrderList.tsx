import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import type { OrderWithItems } from "@/lib/queries/orders";

interface OrderListProps {
  orders: OrderWithItems[];
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrderList({ orders }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="py-16 text-center border border-black">
        <p className="text-xs font-bold uppercase tracking-widest text-black/40">
          No orders yet.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-black">
      <div className="grid grid-cols-5 px-4 py-3 border-b border-black bg-black text-white text-xs font-bold uppercase tracking-widest">
        <span>Order</span>
        <span>Date</span>
        <span>Items</span>
        <span>Total</span>
        <span>Status</span>
      </div>
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="grid grid-cols-5 px-4 py-4 border-b border-black last:border-b-0 hover:bg-black/5 transition-colors"
        >
          <span className="text-xs font-mono truncate">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
          <span className="text-xs">{formatDate(order.created_at)}</span>
          <span className="text-xs">{order.order_items.length} item(s)</span>
          <span className="text-xs font-bold">{formatPrice(order.total)}</span>
          <Badge variant="outline">
            {statusLabels[order.status] ?? order.status}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
