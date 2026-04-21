import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/queries/categories";
import { ProductForm } from "@/components/admin/ProductForm";
import type { ProductWithImages } from "@/types/product";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Edit Product",
  robots: { index: false, follow: false },
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*, categories!category_id(id,name,slug), product_images(id,storage_path,is_primary,sort_order)")
    .eq("id", id)
    .single();

  if (productError || !product) {
    console.error("Product fetch error:", productError?.message);
    notFound();
  }

  const categories = await getCategories();

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
          Edit: {product.name}
        </h1>
      </div>
      <ProductForm product={product as unknown as ProductWithImages} categories={categories} />
    </div>
  );
}
