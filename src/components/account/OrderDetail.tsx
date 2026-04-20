import { formatPrice, formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import type { OrderWithItems } from "@/lib/queries/orders";

interface OrderDetailProps {
  order: OrderWithItems;
}

export function OrderDetail({ order }: OrderDetailProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-black/40 uppercase tracking-widest">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-xs text-black/40 mt-1">
            {formatDate(order.created_at)}
          </p>
        </div>
        <Badge variant="outline">{order.status}</Badge>
      </div>

      {/* Items */}
      <div className="border border-black">
        <div className="px-4 py-3 border-b border-black">
          <h3 className="text-xs font-bold uppercase tracking-widest">Items</h3>
        </div>
        {order.order_items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center px-4 py-4 border-b border-black last:border-b-0"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-widest">
                {item.product_name}
              </p>
              {item.size_cm && (
                <p className="text-xs text-black/40 mt-0.5">{item.size_cm} cm</p>
              )}
              <p className="text-xs text-black/40 mt-0.5">
                Qty: {item.quantity}
              </p>
            </div>
            <p className="text-sm font-bold">{formatPrice(item.subtotal)}</p>
          </div>
        ))}
      </div>

      {/* Shipping */}
      <div className="border border-black">
        <div className="px-4 py-3 border-b border-black">
          <h3 className="text-xs font-bold uppercase tracking-widest">
            Shipping Address
          </h3>
        </div>
        <div className="px-4 py-4 text-sm space-y-1">
          <p className="font-bold">{order.shipping_name}</p>
          <p>{order.shipping_email}</p>
          <p>{order.shipping_address}</p>
          <p>
            {order.shipping_city}, {order.shipping_postal_code}
          </p>
          <p>{order.shipping_country}</p>
        </div>
      </div>

      {/* Totals */}
      <div className="border border-black">
        <div className="px-4 py-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="uppercase tracking-widest text-black/60">Subtotal</span>
            <span className="font-bold">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="uppercase tracking-widest text-black/60">Shipping</span>
            <span className="font-bold">
              {order.shipping_cost === 0 ? "FREE" : formatPrice(order.shipping_cost)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-black">
            <span className="text-xs font-bold uppercase tracking-widest">Total</span>
            <span className="font-black">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
