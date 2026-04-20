import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let profile = null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  } catch {
    // DB not configured
  }

  const quickLinks = [
    { href: "/account/profile", label: "Edit Profile" },
    { href: "/account/orders", label: "Order History" },
    { href: "/account/wishlist", label: "Wishlist" },
  ];

  return (
    <div>
      <div className="border-b border-black pb-8 mb-8">
        <p className="text-xs text-black/40 uppercase tracking-widest mb-2">
          Account
        </p>
        <h1 className="text-2xl font-black uppercase tracking-widest">
          {profile?.full_name ?? user.email}
        </h1>
        <p className="text-xs text-black/40 mt-2">{user.email}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black">
        {quickLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="bg-white p-6 hover:bg-black hover:text-white transition-colors group"
          >
            <p className="text-xs font-black uppercase tracking-widest">
              {label}
            </p>
            <p className="text-xs text-black/40 mt-2 group-hover:text-white/60 transition-colors">
              &rarr;
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
