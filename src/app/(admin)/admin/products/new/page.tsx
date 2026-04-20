import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/queries/categories";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Category } from "@/types/database";

export const metadata: Metadata = {
  title: "Admin — New Product",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch {
    // DB not configured
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/products"
          className="text-xs text-black/40 uppercase tracking-widest hover:text-black transition-colors"
        >
          &larr; Products
        </Link>
        <h1 className="text-2xl font-black uppercase tracking-widest">
          New Product
        </h1>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
