import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/lib/queries/orders";
import { OrderDetail } from "@/components/account/OrderDetail";
import { updateOrderStatus } from "@/lib/actions/orders";

export const metadata: Metadata = {
  title: "Admin — Order Detail",
  robots: { index: false, follow: false },
};

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

const statuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

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
          <div className="border border-black">
            <div className="px-4 py-3 border-b border-black">
              <h3 className="text-xs font-bold uppercase tracking-widest">
                Update Status
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {statuses.map((status) => (
                <form
                  key={status}
                  action={async () => {
                    "use server";
                    await updateOrderStatus(id, status);
                  }}
                >
                  <button
                    type="submit"
                    className={`w-full px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${
                      order.status === status
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-black hover:bg-black hover:!text-white"
                    }`}
                  >
                    {status}
                  </button>
                </form>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
