import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories } from "@/lib/queries/categories";
import { getProductsByCategory } from "@/lib/queries/products";
import { ProductGrid } from "@/components/product/ProductGrid";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  let products = [];
  try {
    products = await getProductsByCategory(category);
  } catch {
    notFound();
  }

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
      <ProductGrid products={products} />
    </div>
  );
}
