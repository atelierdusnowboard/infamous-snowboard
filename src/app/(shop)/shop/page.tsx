import type { Metadata } from "next";
import { Suspense } from "react";
import { getProducts, getProductsByCategory } from "@/lib/queries/products";
import { getCategories } from "@/lib/queries/categories";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import type { ProductWithImages } from "@/types/product";
import type { Category } from "@/types/database";
import {
  applyProductFilters,
  buildFilterSections,
  findCategoryBySlug,
  getProductFamily,
  getProductFamilyLabel,
} from "@/lib/utils/productFilters";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "All Infamous Snowboards — park, freeride, powder, kids. Less noise. More shapes.",
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    size?: string;
    wide?: string;
    [key: string]: string | undefined;
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

  const activeCategory = findCategoryBySlug(categories, params.category);
  const family = getProductFamily(activeCategory?.slug);
  const filterSections = buildFilterSections(products, family);
  const filtered = applyProductFilters(products, params);
  const shopLabel = activeCategory ? activeCategory.name : getProductFamilyLabel(family);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 border-b border-black pb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-2">
          {activeCategory ? "Category" : shopLabel}
        </p>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest">
          Shop
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Filters */}
        <Suspense fallback={null}>
          <ProductFilters
            categories={categories}
            sections={filterSections}
            resetHref="/shop"
          />
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
