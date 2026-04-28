import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCategories } from "@/lib/queries/categories";
import { getProductsByCategory } from "@/lib/queries/products";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { Category } from "@/types/database";
import type { ProductWithImages } from "@/types/product";
import {
  applyProductFilters,
  buildFilterSections,
  getProductFamily,
} from "@/lib/utils/productFilters";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    size?: string;
    wide?: string;
    [key: string]: string | undefined;
  }>;
}

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories.map((c) => ({ category: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const capitalised = category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return { title: capitalised };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  const filters = await searchParams;
  let products: ProductWithImages[] = [];
  let categories: Category[] = [];
  try {
    categories = await getCategories();
    products = await getProductsByCategory(category);
  } catch {
    notFound();
  }

  const family = getProductFamily(category);
  const filterSections = buildFilterSections(products, family);
  const filtered = applyProductFilters(products, filters);

  const title = category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12">
      <div className="mb-12 border-b border-black pb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-2">
          Category
        </p>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest">
          {title}
        </h1>
      </div>
      <div className="flex flex-col lg:flex-row gap-12">
        <Suspense fallback={null}>
          <ProductFilters
            categories={categories}
            sections={filterSections}
            showCategoryFilter={false}
            resetHref={`/shop/${category}`}
          />
        </Suspense>
        <div className="flex-1">
          <ProductGrid products={filtered} />
        </div>
      </div>
    </div>
  );
}
