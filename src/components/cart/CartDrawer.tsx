"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { useUIStore } from "@/lib/store/ui";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const { cartOpen, setCartOpen } = useUIStore();

  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  return (
    <>
      {/* Backdrop */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-md",
          "bg-white border-l border-black",
          "flex flex-col",
          "transition-transform duration-300 ease-in-out",
          cartOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black shrink-0">
          <h2 className="text-sm font-black uppercase tracking-widest">
            Cart ({items.length})
          </h2>
          <button
            onClick={() => setCartOpen(false)}
            className="text-black hover:opacity-60 transition-opacity"
            aria-label="Close cart"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="square" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-black/40">
                Your cart is empty.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCartOpen(false)}
              >
                <Link href="/shop">Shop Boards</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <CartItem key={`${item.variantId}`} item={item} />
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-black p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest">
                Total
              </span>
              <span className="text-lg font-black">{formatPrice(total)}</span>
            </div>
            <Link href="/checkout" onClick={() => setCartOpen(false)}>
              <Button size="lg" className="w-full">
                Checkout
              </Button>
            </Link>
            <Link
              href="/cart"
              onClick={() => setCartOpen(false)}
              className="block text-center text-xs text-black/40 uppercase tracking-widest hover:text-black transition-colors"
            >
              View Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
