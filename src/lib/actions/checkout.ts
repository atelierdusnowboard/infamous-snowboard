"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { formatBoardSize } from "@/lib/utils/format";
import { orderSchema } from "@/lib/validations/order";
import type { CartItem } from "@/types/cart";

export async function createCheckoutSession(
  cartItems: CartItem[],
  shippingData: Record<string, string>
): Promise<{ url: string } | { error: string }> {
  if (cartItems.length === 0) {
    return { error: "Your cart is empty" };
  }

  const parsed = orderSchema.safeParse(shippingData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid shipping data" };
  }

  // Get user session (optional — supports guest checkout)
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  // Use service client for DB writes to bypass RLS issues in Server Actions
  const supabase = createServiceClient();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingCost = subtotal >= 300 ? 0 : 12;
  const total = subtotal + shippingCost;

  // Create the order row with status "pending"
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

  if (orderError || !order) {
    return { error: orderError?.message ?? "Failed to create order" };
  }

  // Insert order items
  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.name,
    product_slug: item.slug,
    variant_id: item.variantId,
    size_cm: item.size ?? null,
    is_wide: item.isWide,
    unit_price: item.price,
    quantity: item.quantity,
    subtotal: item.price * item.quantity,
    image_path: item.image ?? null,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    return { error: itemsError.message };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Build Stripe line items
  const lineItems = cartItems.map((item) => {
    const imageUrl = item.image ? encodeURI(item.image) : null;
    return {
      price_data: {
        currency: "eur",
        product_data: {
          name: item.size ? `${item.name} — ${formatBoardSize(item.size, item.isWide)} cm` : item.name,
          ...(imageUrl ? { images: [imageUrl] } : {}),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    };
  });

  // Add shipping as a line item if applicable
  if (shippingCost > 0) {
    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: { name: "Shipping" },
        unit_amount: Math.round(shippingCost * 100),
      },
      quantity: 1,
    });
  }

  // Créer un Customer Stripe pour pré-remplir nom + adresse
  const customer = await stripe.customers.create({
    name: parsed.data.name,
    email: parsed.data.email,
    address: {
      line1: parsed.data.address,
      city: parsed.data.city,
      postal_code: parsed.data.postal_code,
      country: parsed.data.country.length === 2
        ? parsed.data.country.toUpperCase()
        : "FR",
    },
    shipping: {
      name: parsed.data.name,
      address: {
        line1: parsed.data.address,
        city: parsed.data.city,
        postal_code: parsed.data.postal_code,
        country: parsed.data.country.length === 2
          ? parsed.data.country.toUpperCase()
          : "FR",
      },
    },
  });

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customer.id,
    line_items: lineItems,
    success_url: `${siteUrl}/checkout/confirmation/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout`,
    metadata: { orderId: order.id },
    shipping_address_collection: {
      allowed_countries: ["FR", "BE", "CH", "DE", "IT", "ES", "GB", "US", "CA"],
    },
  });

  if (!session.url) {
    return { error: "Failed to create Stripe session" };
  }

  return { url: session.url };
}
