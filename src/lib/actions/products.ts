"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validations/product";
import { getStripe } from "@/lib/stripe/server";

async function syncToStripe(
  productId: string,
  name: string,
  description: string | null,
  imageUrl: string | null,
  existingStripeId: string | null
): Promise<string | null> {
  try {
    const stripe = getStripe();
    const params = {
      name,
      description: description ?? undefined,
      images: imageUrl ? [imageUrl] : undefined,
      metadata: { infamous_product_id: productId },
    };

    let stripeProductId = existingStripeId;

    if (stripeProductId) {
      await stripe.products.update(stripeProductId, params);
    } else {
      const product = await stripe.products.create(params);
      stripeProductId = product.id;
      // Store Stripe product ID in DB
      const supabase = createServiceClient();
      await supabase.from("products").update({ stripe_product_id: stripeProductId }).eq("id", productId);
    }

    return stripeProductId;
  } catch {
    // Stripe sync is non-blocking — don't fail the product save
    return null;
  }
}

async function syncProductCategories(productId: string, categoryIds: string[]) {
  const supabase = createServiceClient();
  await supabase.from("product_categories").delete().eq("product_id", productId);
  if (categoryIds.length > 0) {
    await supabase.from("product_categories").insert(
      categoryIds.map((cid) => ({ product_id: productId, category_id: cid }))
    );
  }
}

export async function createProduct(formData: FormData, categoryIds: string[] = []) {
  const primaryCategoryId = categoryIds[0] ?? null;

  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    tagline: formData.get("tagline") as string,
    description: formData.get("description") as string,
    price: Number(formData.get("price")),
    category_id: primaryCategoryId || null,
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
  if (data) {
    await syncProductCategories(data.id, categoryIds);
    // Sync to Stripe (non-blocking)
    const { data: img } = await createServiceClient()
      .from("product_images").select("storage_path").eq("product_id", data.id).eq("is_primary", true).single();
    await syncToStripe(data.id, parsed.data.name, parsed.data.description ?? null, img?.storage_path ?? null, null);
  }
  revalidatePath("/admin/products");
  revalidatePath("/shop", "layout");
  return { success: true, product: data };
}

export async function updateProduct(id: string, formData: FormData, categoryIds: string[] = []) {
  const primaryCategoryId = categoryIds[0] ?? null;

  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    tagline: formData.get("tagline") as string,
    description: formData.get("description") as string,
    price: Number(formData.get("price")),
    category_id: primaryCategoryId || null,
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
  // Always sync categories (even empty = remove all)
  await syncProductCategories(id, categoryIds);
  // Sync to Stripe (non-blocking)
  const sc = createServiceClient();
  const { data: existing } = await sc.from("products").select("stripe_product_id").eq("id", id).single();
  const { data: img } = await sc.from("product_images").select("storage_path").eq("product_id", id).eq("is_primary", true).single();
  await syncToStripe(id, parsed.data.name, parsed.data.description ?? null, img?.storage_path ?? null, existing?.stripe_product_id ?? null);
  revalidatePath("/admin/products");
  revalidatePath(`/products/${parsed.data.slug}`);
  revalidatePath("/shop", "layout");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  // Get slug before deleting for cache invalidation
  const { data: product } = await supabase.from("products").select("slug").eq("id", id).single();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  revalidatePath("/shop", "layout");
  if (product?.slug) revalidatePath(`/products/${product.slug}`);
  return { success: true };
}

export async function uploadProductImage(
  productId: string,
  file: File,
  isPrimary: boolean = false
) {
  const supabase = createServiceClient();
  const ext = file.name.split(".").pop();
  const storagePath = `${productId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(storagePath, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  // Count existing images to set sort_order
  const { count } = await supabase
    .from("product_images")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  const { data, error: dbError } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      storage_path: storagePath,
      is_primary: isPrimary,
      sort_order: count ?? 0,
    })
    .select()
    .single();

  if (dbError) return { error: dbError.message };
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/products`);
  return { success: true, image: data };
}

export async function setProductImagePrimary(imageId: string, productId: string) {
  const supabase = createServiceClient();

  // Unset all primaries for this product
  await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);

  // Set the selected one
  const { error } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId);

  if (error) return { error: error.message };
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/products`);
  return { success: true };
}

export async function deleteProductImage(imageId: string, storagePath: string, productId: string) {
  const supabase = createServiceClient();

  await supabase.storage.from("product-images").remove([storagePath]);

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) return { error: error.message };
  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}
