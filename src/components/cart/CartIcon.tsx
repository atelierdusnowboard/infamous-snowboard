"use client";

import { useCartStore } from "@/lib/store/cart";
import { useUIStore } from "@/lib/store/ui";

export function CartIcon() {
  const count = useCartStore((s) => s.count);
  const { toggleCart } = useUIStore();

  return (
    <button
      onClick={toggleCart}
      className="relative flex items-center justify-center hover:opacity-60 transition-opacity"
      aria-label={`Cart — ${count} items`}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="square"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white text-[10px] font-bold flex items-center justify-center leading-none">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
