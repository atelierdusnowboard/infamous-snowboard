import type { Metadata } from "next";
import { Suspense } from "react";
import { getProducts, getProductsByCategory } from "@/lib/queries/products";
import { getCategories } from "@/lib/queries/categories";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import type { ProductWithImages } from "@/types/product";
import type { Category } from "@/types/database";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "All Infamous Snowboards — park, freeride, powder, kids. Less noise. More shapes.",
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    difficulty?: string;
    terrain?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  let products: ProductWithImages[] = [];
  let categories: Category[] = [];

  try {
    categories = await getCategories();
    // Use junction table query when filtering by category
    products = params.category
      ? await getProductsByCategory(params.category)
      : await getProducts();
  } catch {
    // DB not configured yet
  }

  const filtered = products;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 border-b border-black pb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-2">
          All Boards
        </p>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest">
          Shop
        </h1>
      </div>

      <div className="flex gap-12">
        {/* Filters */}
        <Suspense fallback={null}>
          <ProductFilters categories={categories} />
        </Suspense>

        {/* Grid */}
        <div className="flex-1">
          <Suspense fallback={<ProductGridSkeleton count={8} />}>
            <ProductGrid products={filtered} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
