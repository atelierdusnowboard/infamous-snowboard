import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/queries/categories";
import { ProductForm } from "@/components/admin/ProductForm";
import type { ProductWithImages } from "@/types/product";

export const metadata: Metadata = {
  title: "Admin — Edit Product",
  robots: { index: false, follow: false },
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  let product = null;
  let categories = [];

  try {
    const [productRes, catsRes] = await Promise.all([
      supabase
        .from("products")
        .select(
          "*, categories(id,name,slug), product_images(id,storage_path,is_primary,sort_order)"
        )
        .eq("id", id)
        .single(),
      getCategories(),
    ]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    product = productRes.data as any as ProductWithImages;
    categories = catsRes;
  } catch {
    notFound();
  }

  if (!product) notFound();

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
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
