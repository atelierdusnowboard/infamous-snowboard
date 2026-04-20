import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductWithImages } from "@/types/product";

interface FeaturedProductsProps {
  products: ProductWithImages[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="py-16 md:py-24 border-t border-black">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* Section header */}
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-widest">
            Featured Boards
          </h2>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-widest hover:opacity-60 transition-opacity hidden md:block"
          >
            View All &rarr;
          </Link>
        </div>

        {/* Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className="border-0"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black">
            {/* Static fallback cards */}
            {[
              { slug: "gun", name: "Gun", price: 549, image: "/boards/2026 Infamous Gun-01.JPG" },
              { slug: "team-ripper", name: "Team Ripper", price: 529, image: "/boards/2026 Infamous Ripper-01.JPG" },
              { slug: "park-rat", name: "Park Rat", price: 499, image: "/boards/2026 Infamous Park Rat-01.JPG" },
              { slug: "punk-cat", name: "Punk Cat", price: 489, image: "/boards/2026 Infamous Punk Cat-01.JPG" },
            ].map((board) => (
              <Link
                key={board.slug}
                href={`/products/${board.slug}`}
                className="group block border-0 bg-white"
              >
                <div className="relative aspect-square overflow-hidden bg-white">
                  <img
                    src={board.image}
                    alt={board.name}
                    className="w-full h-full object-cover grayscale transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-black uppercase tracking-widest">{board.name}</h3>
                  <p className="text-sm font-bold mt-1">{board.price} €</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 md:hidden text-center">
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
          >
            View All Boards &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
