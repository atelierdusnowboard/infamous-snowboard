import { createPublicClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Category = Database["public"]["Tables"]["categories"]["Row"];

export async function getCategories(navOnly = false): Promise<Category[]> {
  const supabase = createPublicClient();

  if (navOnly) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("show_in_nav", true)
      .order("sort_order", { ascending: true });

    if (!error) return data ?? [];

    // Fallback if show_in_nav column doesn't exist yet
    const { data: fallback } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    return fallback ?? [];
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!error) return data ?? [];

  // Fallback if sort_order column doesn't exist yet
  const { data: fallback } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  return fallback ?? [];
}
