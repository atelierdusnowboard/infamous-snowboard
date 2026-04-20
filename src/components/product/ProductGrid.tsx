import { ProductCard } from "./ProductCard";
import type { ProductWithImages } from "@/types/product";

interface ProductGridProps {
  products: ProductWithImages[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-24 text-center border border-black">
        <p className="text-xs font-bold uppercase tracking-widest text-black/40">
          No products found.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-black">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} className="border-0" />
      ))}
    </div>
  );
}
