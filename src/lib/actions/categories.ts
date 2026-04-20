"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

export async function createCategory(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const showInNav = formData.get("show_in_nav") === "on";
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!name || !slug) return { error: "Nom et slug requis" };

  const supabase = createServiceClient();
  const { error } = await supabase.from("categories").insert({
    name,
    slug,
    show_in_nav: showInNav,
    sort_order: sortOrder,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/shop", "layout");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/shop", "layout");
  return { success: true };
}

export async function toggleCategoryNav(id: string, current: boolean) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("categories")
    .update({ show_in_nav: !current })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/shop", "layout");
  return { success: true };
}

export async function updateCategorySortOrder(id: string, sortOrder: number) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("categories")
    .update({ sort_order: sortOrder })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/shop", "layout");
  return { success: true };
}
