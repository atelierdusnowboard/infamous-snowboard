import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Paywall } from "@/components/subscription/Paywall";
import { CustomerCenter } from "@/components/subscription/CustomerCenter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Pro — Infamous Snowboard",
  description: "Unlock exclusive content, early access, and rider discounts.",
};

export default async function ProPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let subscription = null;
  if (user) {
    try {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();
      subscription = data;
    } catch {
      // No subscription
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-16">
        {subscription ? (
          <CustomerCenter subscription={subscription} />
        ) : user ? (
          <Paywall userId={user.id} />
        ) : (
          <Paywall userId="guest" />
        )}
      </main>
      <Footer />
    </div>
  );
}
