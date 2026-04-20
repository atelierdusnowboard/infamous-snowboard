import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Category = Database["public"]["Tables"]["categories"]["Row"];

export async function getCategories(navOnly = false): Promise<Category[]> {
  const supabase = await createClient();
  let query = supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (navOnly) {
    query = query.eq("show_in_nav", true) as typeof query;
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}
