"use client";

import { cn } from "@/lib/utils/cn";
import { compareSize } from "@/lib/utils/format";
import type { ProductVariant } from "@/types/database";

interface ProductSizeSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: string | null;
  onSelect: (variant: ProductVariant) => void;
}

export function ProductSizeSelector({
  variants,
  selectedVariantId,
  onSelect,
}: ProductSizeSelectorProps) {
  const sorted = [...variants].sort((a, b) => compareSize(a.size, b.size));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold uppercase tracking-widest">
          Size
        </label>
        {selectedVariantId && (
          <span className="text-xs text-black/40 uppercase tracking-widest">
            Selected
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {sorted.map((variant) => {
          const outOfStock = variant.stock_qty <= 0;
          const isSelected = selectedVariantId === variant.id;

          return (
            <button
              key={variant.id}
              onClick={() => !outOfStock && onSelect(variant)}
              disabled={outOfStock}
              className={cn(
                "relative border px-4 py-2 text-xs font-bold uppercase tracking-widest",
                "transition-colors duration-150",
                isSelected
                  ? "bg-black text-white border-black"
                  : outOfStock
                    ? "bg-white text-black/30 border-black/30 cursor-not-allowed"
                    : "bg-white text-black border-black hover:bg-black hover:!text-white"
              )}
              aria-pressed={isSelected}
            >
              {outOfStock && (
                <span
                  className="absolute inset-0 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="absolute w-full border-t border-black/30 rotate-12" />
                </span>
              )}
              {variant.size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
