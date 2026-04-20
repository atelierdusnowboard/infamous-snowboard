import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { ProductWithImages } from "@/types/product";

export const metadata: Metadata = {
  title: "Wishlist",
  robots: { index: false, follow: false },
};

export default async function AccountWishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let products: ProductWithImages[] = [];
  try {
    const { data } = await supabase
      .from("wishlists")
      .select(
        `
        product_id,
        products (
          *,
          categories ( id, name, slug ),
          product_images ( id, storage_path, is_primary, sort_order )
        )
      `
      )
      .eq("user_id", user.id);

    products = (data ?? [])
      .map((w) => w.products)
      .filter(Boolean) as unknown as ProductWithImages[];
  } catch {
    // DB not configured
  }

  return (
    <div>
      <div className="border-b border-black pb-8 mb-8">
        <h1 className="text-2xl font-black uppercase tracking-widest">
          Wishlist
        </h1>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
