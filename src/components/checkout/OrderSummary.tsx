"use client";

import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { formatBoardSize, formatPrice } from "@/lib/utils/format";

export function OrderSummary() {
  const items = useCartStore((s) => s.items);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = total >= 300 ? 0 : 12;

  return (
    <div className="border border-black">
      <div className="p-4 border-b border-black">
        <h3 className="text-sm font-black uppercase tracking-widest">
          Order Summary
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-4">
            <div className="relative w-14 h-14 shrink-0 border border-black bg-white overflow-hidden">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="56px"
                  className="object-cover grayscale"
                />
              ) : (
                <div className="w-full h-full bg-black/5" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest">
                {item.name}
              </p>
              {item.size && (
                <p className="text-xs text-black/40 mt-0.5">
                  {formatBoardSize(item.size, item.isWide)} cm
                </p>
              )}
              <p className="text-xs mt-1">
                {item.quantity} × {formatPrice(item.price)}
              </p>
            </div>
            <p className="text-xs font-bold shrink-0">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-black space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-black/60 uppercase tracking-widest">Subtotal</span>
          <span className="font-bold">{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-black/60 uppercase tracking-widest">Shipping</span>
          <span className="font-bold">{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
        </div>
        <div className="pt-2 border-t border-black flex justify-between">
          <span className="text-xs font-bold uppercase tracking-widest">Total</span>
          <span className="text-base font-black">{formatPrice(total + shipping)}</span>
        </div>
      </div>
    </div>
  );
}
