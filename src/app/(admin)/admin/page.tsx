import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDate } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  let stats = { products: 0, orders: 0, posts: 0, drafts: 0 };
  let recentOrders: Array<{
    id: string;
    shipping_name: string;
    total: number;
    status: string;
    created_at: string;
  }> = [];

  try {
    const [productRes, orderRes, postRes, draftRes, recentRes] =
      await Promise.all([
        supabase.from("products").select("id", { count: "exact" }),
        supabase.from("orders").select("id", { count: "exact" }),
        supabase
          .from("blog_posts")
          .select("id", { count: "exact" })
          .eq("is_published", true),
        supabase
          .from("blog_posts")
          .select("id", { count: "exact" })
          .eq("is_published", false),
        supabase
          .from("orders")
          .select("id, shipping_name, total, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

    stats = {
      products: productRes.count ?? 0,
      orders: orderRes.count ?? 0,
      posts: postRes.count ?? 0,
      drafts: draftRes.count ?? 0,
    };
    recentOrders = recentRes.data ?? [];
  } catch {
    // DB not configured
  }

  const statCards = [
    { label: "Products", value: stats.products, href: "/admin/products" },
    { label: "Orders", value: stats.orders, href: "/admin/orders" },
    { label: "Published Posts", value: stats.posts, href: "/admin/blog" },
    { label: "Draft Posts", value: stats.drafts, href: "/admin/blog" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-widest">
          Dashboard
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black mb-12">
        {statCards.map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white p-6 hover:bg-black hover:text-white transition-colors group"
          >
            <p className="text-3xl font-black">{value}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-black/40 group-hover:text-white/60 mt-1 transition-colors">
              {label}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-widest">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs text-black/40 uppercase tracking-widest hover:text-black transition-colors"
          >
            View All &rarr;
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="border border-black">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between px-4 py-3 border-b border-black last:border-b-0 hover:bg-black/5 transition-colors"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest">
                    {order.shipping_name}
                  </p>
                  <p className="text-xs text-black/40">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold">
                    {formatPrice(order.total)}
                  </p>
                  <p className="text-xs text-black/40 uppercase">
                    {order.status}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-black py-8 text-center">
            <p className="text-xs text-black/40 uppercase tracking-widest">
              No orders yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
