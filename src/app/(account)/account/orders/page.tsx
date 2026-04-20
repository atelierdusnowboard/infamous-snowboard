import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserOrders } from "@/lib/queries/orders";
import { OrderList } from "@/components/account/OrderList";
import type { OrderWithItems } from "@/lib/queries/orders";

export const metadata: Metadata = {
  title: "Order History",
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let orders: OrderWithItems[] = [];
  try {
    orders = await getUserOrders(user.id);
  } catch {
    // DB not configured
  }

  return (
    <div>
      <div className="border-b border-black pb-8 mb-8">
        <h1 className="text-2xl font-black uppercase tracking-widest">
          Order History
        </h1>
      </div>
      <OrderList orders={orders} />
    </div>
  );
}
