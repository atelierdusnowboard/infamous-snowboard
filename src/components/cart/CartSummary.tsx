import { formatPrice } from "@/lib/utils/format";

interface CartSummaryProps {
  subtotal: number;
}

export function CartSummary({ subtotal }: CartSummaryProps) {
  const shipping = subtotal >= 300 ? 0 : 12;
  const total = subtotal + shipping;

  return (
    <div className="border border-black">
      <div className="p-4 border-b border-black">
        <h3 className="text-xs font-bold uppercase tracking-widest">Order Summary</h3>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-black/60 uppercase tracking-widest text-xs">Subtotal</span>
          <span className="font-bold">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-black/60 uppercase tracking-widest text-xs">Shipping</span>
          <span className="font-bold">
            {shipping === 0 ? "FREE" : formatPrice(shipping)}
          </span>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-black/40">
            Free shipping on orders over {formatPrice(300)}
          </p>
        )}
        <div className="pt-3 border-t border-black flex justify-between">
          <span className="text-xs font-bold uppercase tracking-widest">Total</span>
          <span className="text-base font-black">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
