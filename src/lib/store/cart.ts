import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartStore } from "@/types/cart";
import { cartSubtotal } from "@/lib/utils/money";

function cartValues(items: CartItem[]) {
  return { items, total: cartSubtotal(items), count: items.reduce((sum, item) => sum + item.quantity, 0) };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...cartValues([]),

      addItem: (item: CartItem) => {
        const existing = get().items.find(
          (i) => i.variantId === item.variantId && i.productId === item.productId
        );
        if (existing) {
          set((state) => cartValues(state.items.map((i) =>
              i.variantId === item.variantId && i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )));
        } else {
          set((state) => cartValues([...state.items, item]));
        }
      },

      restoreItems: (items: CartItem[]) => {
        set(cartValues(items));
      },

      removeItem: (variantId: string) => {
        set((state) => cartValues(state.items.filter((i) => i.variantId !== variantId)));
      },

      updateQty: (variantId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set((state) => cartValues(state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          )));
      },

      clearCart: () => set(cartValues([])),
    }),
    {
      name: "infamous-cart",
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => {
        const saved = persisted as { items?: CartItem[] } | undefined;
        return { ...current, ...cartValues(Array.isArray(saved?.items) ? saved.items : current.items) };
      },
    }
  )
);
