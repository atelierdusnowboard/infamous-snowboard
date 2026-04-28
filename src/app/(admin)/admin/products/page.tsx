import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/queries/categories";
import { deleteProduct } from "@/lib/actions/products";
import { formatPrice } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { CategoryFilter } from "./CategoryFilter";

export const metadata: Metadata = {
  title: "Admin — Products",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  const categories = await getCategories();

  let products: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    is_published: boolean;
    is_featured: boolean;
    created_at: string;
  }> = [];

  try {
    if (category) {
      const cat = categories.find((c) => c.slug === category);
      if (cat) {
        const { data: ids } = await supabase
          .from("product_categories")
          .select("product_id")
          .eq("category_id", cat.id);

        const productIds = (ids ?? []).map((r) => r.product_id);

        if (productIds.length > 0) {
          const { data } = await supabase
            .from("products")
            .select("id, name, slug, price, is_published, is_featured, created_at")
            .in("id", productIds)
            .order("created_at", { ascending: false });
          products = data ?? [];
        }
      }
    } else {
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, price, is_published, is_featured, created_at")
        .order("created_at", { ascending: false });
      products = data ?? [];
    }
  } catch {
    // DB not configured
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black uppercase tracking-widest">
          Products
        </h1>
        <Link href="/admin/products/new">
          <Button size="sm">+ New Product</Button>
        </Link>
      </div>

      <Suspense>
        <CategoryFilter categories={categories} />
      </Suspense>

      <div className="border border-black">
        <div className="grid grid-cols-5 px-4 py-3 border-b border-black bg-black text-white text-xs font-bold uppercase tracking-widest">
          <span className="col-span-2">Name</span>
          <span>Price</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {products.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xs text-black/40 uppercase tracking-widest">
              {category ? "Aucun produit dans cette catégorie." : "No products yet."}
            </p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="grid grid-cols-5 px-4 py-4 border-b border-black last:border-b-0 items-center"
            >
              <div className="col-span-2">
                <p className="text-xs font-bold uppercase tracking-widest">
                  {product.name}
                </p>
                <p className="text-xs text-black/40 font-mono">{product.slug}</p>
              </div>
              <span className="text-xs font-bold">
                {formatPrice(product.price)}
              </span>
              <div className="flex gap-2">
                {product.is_published ? (
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Published
                  </span>
                ) : (
                  <span className="text-xs text-black/40 uppercase tracking-widest">
                    Draft
                  </span>
                )}
                {product.is_featured && (
                  <span className="text-xs font-bold uppercase tracking-widest">
                    ★
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="text-xs font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
                >
                  Edit
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deleteProduct(product.id);
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs text-black/40 uppercase tracking-widest hover:text-black transition-colors"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>

      {products.length > 0 && (
        <p className="mt-3 text-xs text-black/40 uppercase tracking-widest text-right">
          {products.length} produit{products.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
