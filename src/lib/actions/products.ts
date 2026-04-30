"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validations/product";
import { getStripe } from "@/lib/stripe/server";
import { getProductImageUrl } from "@/lib/utils/image";

const productVariantSchema = z.object({
  id: z.string().uuid().optional(),
  size: z.string().min(1, "Size is required").max(20, "Size too long"),
  stock_qty: z.number().int().min(0, "Stock must be zero or more"),
  price_delta: z.number(),
});

const productVariantsSchema = z
  .array(productVariantSchema)
  .superRefine((variants, ctx) => {
    const seen = new Set<string>();

    variants.forEach((variant, index) => {
      const key = variant.size.trim().toLowerCase();

      if (seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: "Each size must be unique",
          path: [index, "size"],
        });
      }
      seen.add(key);
    });
  });

async function syncToStripe(
  productId: string,
  name: string,
  description: string | null,
  imageUrl: string | null,
  existingStripeId: string | null
): Promise<string | null> {
  try {
    const stripe = getStripe();
    const fullImageUrl = getProductImageUrl(imageUrl);
    const params = {
      name,
      description: description || undefined,
      images: fullImageUrl ? [encodeURI(fullImageUrl)] : undefined,
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

async function syncProductVariants(
  productId: string,
  variants: Array<{
    id?: string;
    size: string;
    stock_qty: number;
    price_delta: number;
  }>
) {
  const supabase = createServiceClient();

  const { data: existing, error: existingError } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", productId);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const keepIds = new Set(variants.flatMap((variant) => (variant.id ? [variant.id] : [])));
  const deleteIds = (existing ?? [])
    .map((variant) => variant.id)
    .filter((id) => !keepIds.has(id));

  if (deleteIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("product_variants")
      .delete()
      .in("id", deleteIds);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }

  for (const variant of variants) {
    if (variant.id) {
      const { error: updateError } = await supabase
        .from("product_variants")
        .update({
          size: variant.size,
          stock_qty: variant.stock_qty,
          price_delta: variant.price_delta,
        })
        .eq("id", variant.id)
        .eq("product_id", productId);

      if (updateError) {
        throw new Error(updateError.message);
      }
      continue;
    }

    const { error: insertError } = await supabase.from("product_variants").insert({
      product_id: productId,
      size: variant.size,
      stock_qty: variant.stock_qty,
      price_delta: variant.price_delta,
    });

    if (insertError) {
      throw new Error(insertError.message);
    }
  }
}

async function revalidateProductViews(productId: string) {
  const supabase = createServiceClient();
  const { data: product } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .single();

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop", "layout");
  revalidatePath("/");

  if (product?.slug) {
    revalidatePath(`/products/${product.slug}`);
  }
}

function parseVariants(formData: FormData) {
  try {
    const rawVariants = formData.get("variants");
    const parsedJson = rawVariants ? JSON.parse(rawVariants as string) : [];
    return productVariantsSchema.safeParse(parsedJson);
  } catch {
    return productVariantsSchema.safeParse(null);
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
  const parsedVariants = parseVariants(formData);
  if (!parsedVariants.success) {
    return { error: parsedVariants.error.issues[0]?.message ?? "Invalid variants" };
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
    await syncProductVariants(data.id, parsedVariants.data);
    // Sync to Stripe (non-blocking)
    const { data: img } = await createServiceClient()
      .from("product_images").select("storage_path").eq("product_id", data.id).eq("is_primary", true).single();
    await syncToStripe(data.id, parsed.data.name, parsed.data.description ?? null, img?.storage_path ?? null, null);
  }
  revalidatePath("/admin/products");
  revalidatePath(`/products/${parsed.data.slug}`);
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
  const parsedVariants = parseVariants(formData);
  if (!parsedVariants.success) {
    return { error: parsedVariants.error.issues[0]?.message ?? "Invalid variants" };
  }

  const supabase = await createClient();
  const { data: existingProduct } = await supabase
    .from("products")
    .select("slug")
    .eq("id", id)
    .single();
  const { error } = await supabase
    .from("products")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  // Always sync categories (even empty = remove all)
  await syncProductCategories(id, categoryIds);
  await syncProductVariants(id, parsedVariants.data);
  // Sync to Stripe (non-blocking)
  const sc = createServiceClient();
  const { data: existing } = await sc.from("products").select("stripe_product_id").eq("id", id).single();
  const { data: img } = await sc.from("product_images").select("storage_path").eq("product_id", id).eq("is_primary", true).single();
  await syncToStripe(id, parsed.data.name, parsed.data.description ?? null, img?.storage_path ?? null, existing?.stripe_product_id ?? null);
  revalidatePath("/admin/products");
  if (existingProduct?.slug && existingProduct.slug !== parsed.data.slug) {
    revalidatePath(`/products/${existingProduct.slug}`);
  }
  revalidatePath(`/products/${parsed.data.slug}`);
  revalidatePath("/shop", "layout");
  return { success: true };
}

export async function syncAllProductsToStripe(): Promise<{ synced: number; errors: number }> {
  const supabase = createServiceClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, description, slug, stripe_product_id, product_images(storage_path, is_primary)");

  if (!products) return { synced: 0, errors: 0 };

  let synced = 0;
  let errors = 0;

  for (const product of products) {
    const images = product.product_images as { storage_path: string; is_primary: boolean }[];
    const primary = images.find((i) => i.is_primary) ?? images[0];
    const result = await syncToStripe(
      product.id,
      product.name,
      product.description ?? null,
      primary?.storage_path ?? null,
      product.stripe_product_id ?? null
    );
    if (result) synced++;
    else errors++;
  }

  revalidatePath("/admin/products");
  return { synced, errors };
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
  await revalidateProductViews(productId);
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
  await revalidateProductViews(productId);
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
  await revalidateProductViews(productId);
  return { success: true };
}
