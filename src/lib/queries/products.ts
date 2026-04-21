import { createPublicClient } from "@/lib/supabase/server";
import type { ProductWithImages, ProductWithVariants } from "@/types/product";

const SELECT_WITH_IMAGES = `
  *,
  categories ( id, name, slug ),
  product_images ( id, storage_path, is_primary, sort_order )
`;

const SELECT_WITH_VARIANTS = `
  *,
  categories ( id, name, slug ),
  product_images ( id, storage_path, is_primary, sort_order ),
  product_variants ( id, size_cm, stock_qty, price_delta )
`;

export async function getProducts() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT_WITH_IMAGES)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ProductWithImages[];
}

export async function getProductBySlug(slug: string) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT_WITH_VARIANTS)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) return null;
  return data as ProductWithVariants;
}

export async function getProductsByCategory(categorySlug: string) {
  const supabase = createPublicClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (!category) return [] as ProductWithImages[];

  const { data, error } = await supabase
    .from("products")
    .select(SELECT_WITH_IMAGES)
    .eq("category_id", category.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ProductWithImages[];
}

export async function getFeaturedProducts() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT_WITH_IMAGES)
    .eq("is_published", true)
    .eq("is_featured", true)
    .limit(4);

  if (error) throw new Error(error.message);
  return (data ?? []) as ProductWithImages[];
}

export async function searchProducts(query: string) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT_WITH_IMAGES)
    .eq("is_published", true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

  if (error) throw new Error(error.message);
  return (data ?? []) as ProductWithImages[];
}

export async function getAllProductSlugs() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("is_published", true);
  return (data ?? []).map((p) => p.slug);
}
