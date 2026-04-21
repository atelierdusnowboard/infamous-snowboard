import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Category = Database["public"]["Tables"]["categories"]["Row"];

export async function getCategories(navOnly = false): Promise<Category[]> {
  const supabase = await createClient();

  let query = supabase.from("categories").select("*");

  if (navOnly) {
    // show_in_nav may not exist yet if migration 0004 hasn't run
    try {
      const { data, error } = await query
        .eq("show_in_nav", true)
        .order("sort_order", { ascending: true });
      if (!error) return data ?? [];
    } catch {
      // fall through to unfiltered query
    }
  }

  const { data, error } = await query.order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}
