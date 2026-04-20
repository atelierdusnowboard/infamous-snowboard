import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOrderById } from "@/lib/queries/orders";
import { OrderDetail } from "@/components/account/OrderDetail";

export const metadata: Metadata = {
  title: "Order Detail",
  robots: { index: false, follow: false },
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let order = null;
  try {
    order = await getOrderById(id);
  } catch {
    notFound();
  }

  if (!order || (order.user_id !== user.id)) notFound();

  return (
    <div>
      <div className="border-b border-black pb-8 mb-8 flex items-center gap-4">
        <Link
          href="/account/orders"
          className="text-xs text-black/40 uppercase tracking-widest hover:text-black transition-colors"
        >
          &larr; Orders
        </Link>
        <h1 className="text-2xl font-black uppercase tracking-widest">
          Order Details
        </h1>
      </div>
      <OrderDetail order={order} />
    </div>
  );
}
