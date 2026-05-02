import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export async function getUserOrders(userId: string): Promise<OrderWithItems[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (*)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as OrderWithItems[];
}

export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (*)
    `
    )
    .eq("id", orderId)
    .single();

  if (error) return null;
  return data as OrderWithItems;
}

export async function getAllOrders(status?: string): Promise<OrderWithItems[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(
      `
      *,
      order_items (*)
    `
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as OrderWithItems[];
}
