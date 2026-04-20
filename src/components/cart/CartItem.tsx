"use client";

import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils/format";
import type { CartItem as CartItemType } from "@/types/cart";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQty } = useCartStore();

  return (
    <div className="flex gap-4 py-4 border-b border-black last:border-b-0">
      {/* Image */}
      <div className="relative w-16 h-16 shrink-0 border border-black bg-white overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="64px"
            className="object-cover grayscale"
          />
        ) : (
          <div className="w-full h-full bg-black/5" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest truncate">
          {item.name}
        </p>
        {item.size && (
          <p className="text-xs text-black/40 mt-0.5 uppercase tracking-widest">
            {item.size} cm
          </p>
        )}
        <p className="text-xs font-bold mt-1">{formatPrice(item.price)}</p>

        {/* Qty controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQty(item.variantId, item.quantity - 1)}
            className="w-6 h-6 border border-black flex items-center justify-center text-xs font-bold hover:bg-black hover:!text-white transition-colors"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="text-xs font-bold w-6 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQty(item.variantId, item.quantity + 1)}
            className="w-6 h-6 border border-black flex items-center justify-center text-xs font-bold hover:bg-black hover:!text-white transition-colors"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem(item.variantId)}
        className="self-start text-black/40 hover:text-black transition-colors shrink-0"
        aria-label="Remove item"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="square" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
