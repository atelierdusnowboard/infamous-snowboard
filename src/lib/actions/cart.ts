"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addToWishlist(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Must be logged in" };

  const { error } = await supabase.from("wishlists").upsert(
    { user_id: user.id, product_id: productId },
    { onConflict: "user_id,product_id" }
  );

  if (error) return { error: error.message };
  revalidatePath("/account/wishlist");
  return { success: true };
}

export async function removeFromWishlist(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Must be logged in" };

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);

  if (error) return { error: error.message };
  revalidatePath("/account/wishlist");
  return { success: true };
}

export async function getWishlistProductIds(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("wishlists")
    .select("product_id")
    .eq("user_id", user.id);

  return (data ?? []).map((w) => w.product_id);
}
