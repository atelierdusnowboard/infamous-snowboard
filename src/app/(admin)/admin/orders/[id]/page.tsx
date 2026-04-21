import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/lib/queries/orders";
import { OrderDetail } from "@/components/account/OrderDetail";
import { OrderStatusPanel } from "@/components/admin/OrderStatusPanel";

export const metadata: Metadata = {
  title: "Admin — Order Detail",
  robots: { index: false, follow: false },
};

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}


export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;

  let order = null;
  try {
    order = await getOrderById(id);
  } catch {
    notFound();
  }

  if (!order) notFound();

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/orders"
          className="text-xs text-black/40 uppercase tracking-widest hover:text-black transition-colors"
        >
          &larr; Orders
        </Link>
        <h1 className="text-2xl font-black uppercase tracking-widest">
          Order Detail
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <OrderDetail order={order} />
        </div>

        <div>
          <OrderStatusPanel orderId={id} initialStatus={order.status} />
        </div>
      </div>
    </div>
  );
}
