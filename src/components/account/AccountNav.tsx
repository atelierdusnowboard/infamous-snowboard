"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { logout } from "@/lib/actions/auth";

const navItems = [
  { href: "/account", label: "Profile", exact: true },
  { href: "/account/profile", label: "Edit Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/wishlist", label: "Wishlist" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <aside className="w-48 shrink-0">
      <div className="sticky top-24">
        <nav className="border border-black">
          {navItems.map(({ href, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center px-4 py-3",
                  "text-xs font-bold uppercase tracking-widest",
                  "border-b border-black last:border-b-0",
                  "transition-colors duration-150",
                  active
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-black hover:!text-white"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <form action={logout} className="mt-4">
          <button
            type="submit"
            className="w-full text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors py-2"
          >
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
