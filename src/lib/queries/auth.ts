import { createClient } from "@/lib/supabase/server";

export async function getIsAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single() as any;
    return data?.is_admin === true;
  } catch {
    return false;
  }
}
