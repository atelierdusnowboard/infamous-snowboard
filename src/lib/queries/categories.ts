import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Category = Database["public"]["Tables"]["categories"]["Row"];

export async function getCategories(navOnly = false): Promise<Category[]> {
  const supabase = await createClient();

  if (navOnly) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("show_in_nav", true)
      .order("sort_order", { ascending: true });

    // If show_in_nav column doesn't exist yet, fall back to all categories
    if (error) {
      const { data: fallback } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      return fallback ?? [];
    }
    return data ?? [];
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  // Fallback if sort_order column doesn't exist yet
  if (error) {
    const { data: fallback } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    return fallback ?? [];
  }

  return data ?? [];
}
