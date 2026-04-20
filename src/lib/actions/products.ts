"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validations/product";

export async function createProduct(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    tagline: formData.get("tagline") as string,
    description: formData.get("description") as string,
    price: Number(formData.get("price")),
    category_id: formData.get("category_id") as string,
    specs: JSON.parse((formData.get("specs") as string) ?? "{}"),
    is_published: formData.get("is_published") === "true",
    is_featured: formData.get("is_featured") === "true",
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert(parsed.data)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true, product: data };
}

export async function updateProduct(id: string, formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    tagline: formData.get("tagline") as string,
    description: formData.get("description") as string,
    price: Number(formData.get("price")),
    category_id: formData.get("category_id") as string,
    specs: JSON.parse((formData.get("specs") as string) ?? "{}"),
    is_published: formData.get("is_published") === "true",
    is_featured: formData.get("is_featured") === "true",
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  revalidatePath(`/products/${parsed.data.slug}`);
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true };
}

export async function uploadProductImage(
  productId: string,
  file: File,
  isPrimary: boolean = false
) {
  const supabase = await createClient();
  const ext = file.name.split(".").pop();
  const path = `${productId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { error: dbError } = await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: path,
    is_primary: isPrimary,
    sort_order: 0,
  });

  if (dbError) return { error: dbError.message };
  revalidatePath(`/admin/products/${productId}`);
  return { success: true, path };
}
