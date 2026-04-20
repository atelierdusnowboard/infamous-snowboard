import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CustomerCenter } from "@/components/subscription/CustomerCenter";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Subscription",
  robots: { index: false, follow: false },
};

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let subscription = null;
  try {
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();
    subscription = data;
  } catch {
    // DB not configured or no subscription
  }

  return (
    <div>
      <div className="border-b border-black pb-8 mb-8">
        <h1 className="text-2xl font-black uppercase tracking-widest">
          Subscription
        </h1>
      </div>

      {subscription ? (
        <CustomerCenter subscription={subscription} />
      ) : (
        <div className="py-12">
          <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-4">
            No active subscription.
          </p>
          <Link
            href="/pro"
            className="text-xs font-bold uppercase tracking-widest border border-black px-6 py-3 hover:bg-black hover:text-white transition-colors"
          >
            Explore Pro Plans &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
