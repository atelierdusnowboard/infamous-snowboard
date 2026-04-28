"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { orderSchema } from "@/lib/validations/order";
import type { CartItem } from "@/types/cart";

export async function createOrder(
  cartItems: CartItem[],
  shippingData: Record<string, string>
) {
  const parsed = orderSchema.safeParse(shippingData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid shipping data" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingCost = subtotal >= 300 ? 0 : 12;
  const total = subtotal + shippingCost;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      status: "pending",
      shipping_name: parsed.data.name,
      shipping_email: parsed.data.email,
      shipping_address: parsed.data.address,
      shipping_city: parsed.data.city,
      shipping_postal_code: parsed.data.postal_code,
      shipping_country: parsed.data.country,
      subtotal,
      shipping_cost: shippingCost,
      total,
      notes: parsed.data.notes ?? null,
    })
    .select()
    .single();

  if (orderError) return { error: orderError.message };

  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.name,
    product_slug: item.slug,
    variant_id: item.variantId,
    size: item.size ?? null,
    unit_price: item.price,
    quantity: item.quantity,
    subtotal: item.price * item.quantity,
    image_path: item.image ?? null,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) return { error: itemsError.message };

  redirect(`/checkout/confirmation/${order.id}`);
}

export async function updateOrderStatus(
  orderId: string,
  status: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: status as never, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) return { error: error.message };
  return { success: true };
}
