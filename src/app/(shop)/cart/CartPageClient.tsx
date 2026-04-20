"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/Button";

export default function CartPageClient() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-6">
          Your cart is empty.
        </p>
        <Link href="/shop">
          <Button size="lg">Shop Boards</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Items */}
      <div className="lg:col-span-2 border border-black">
        <div className="px-4 py-3 border-b border-black">
          <h2 className="text-xs font-bold uppercase tracking-widest">
            Items ({items.length})
          </h2>
        </div>
        <div className="px-4">
          {items.map((item) => (
            <CartItem key={item.variantId} item={item} />
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="lg:col-span-1 space-y-4">
        <CartSummary subtotal={total} />
        <Link href="/checkout">
          <Button size="lg" className="w-full">
            Proceed to Checkout
          </Button>
        </Link>
        <Link
          href="/shop"
          className="block text-center text-xs text-black/40 uppercase tracking-widest hover:text-black transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
