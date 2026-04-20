"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { useUIStore } from "@/lib/store/ui";
import { CartItem } from "./CartItem";
import { formatPrice } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";

export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { cartOpen, setCartOpen } = useUIStore();
  const shipping = total >= 300 ? 0 : 12;

  if (!cartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 flex flex-col border-l border-black">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black">
          <h2 className="text-sm font-black uppercase tracking-widest">
            Cart ({items.reduce((n, i) => n + i.quantity, 0)})
          </h2>
          <button
            onClick={() => setCartOpen(false)}
            className="text-xs font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
          >
            ✕ Close
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
              <p className="text-xs text-black/40 uppercase tracking-widest text-center">
                Your cart is empty.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCartOpen(false)}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-black">
              {items.map((item) => (
                <CartItem key={item.variantId} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-black p-6 space-y-4">
            <div className="flex justify-between text-xs">
              <span className="text-black/60 uppercase tracking-widest">Subtotal</span>
              <span className="font-bold">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-black/60 uppercase tracking-widest">Shipping</span>
              <span className="font-bold">{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-black">
              <span className="text-xs font-black uppercase tracking-widest">Total</span>
              <span className="text-base font-black">{formatPrice(total + shipping)}</span>
            </div>
            <Link href="/checkout" onClick={() => setCartOpen(false)}>
              <Button size="lg" className="w-full">
                Checkout
              </Button>
            </Link>
            <Link href="/shop" onClick={() => setCartOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
