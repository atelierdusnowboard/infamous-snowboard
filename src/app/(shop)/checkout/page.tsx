import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { createClient } from "@/lib/supabase/server";
import type { CheckoutShippingDraft } from "@/components/checkout/ShippingForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

async function getInitialShipping(): Promise<Partial<CheckoutShippingDraft>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return {};

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name,email")
      .eq("id", user.id)
      .single();

    const { data: latestOrder } = await supabase
      .from("orders")
      .select("shipping_name,shipping_email,shipping_address,shipping_city,shipping_postal_code,shipping_country")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      name: latestOrder?.shipping_name ?? profile?.full_name ?? "",
      email: latestOrder?.shipping_email ?? profile?.email ?? user.email ?? "",
      address: latestOrder?.shipping_address ?? "",
      city: latestOrder?.shipping_city ?? "",
      postal_code: latestOrder?.shipping_postal_code ?? "",
      country: latestOrder?.shipping_country ?? "France",
    };
  } catch {
    return {};
  }
}

export default async function CheckoutPage() {
  const initialShipping = await getInitialShipping();

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12">
      <div className="mb-12 border-b border-black pb-8">
        <h1 className="text-4xl font-black uppercase tracking-widest">
          Checkout
        </h1>
      </div>
      <CheckoutForm initialShipping={initialShipping} />
    </div>
  );
}
