"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/blog", label: "Blog" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-black min-h-full bg-white">
      <div className="p-6 border-b border-black">
        <span className="text-xs font-bold uppercase tracking-widest text-black/40">
          Admin
        </span>
        <p className="text-sm font-black uppercase tracking-widest mt-1">
          Infamous
        </p>
      </div>
      <nav className="p-4">
        {navItems.map(({ href, label, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname.startsWith(href) && (exact || pathname !== "/admin");
          const active = exact ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className="flex items-center px-4 py-3 mb-1 text-xs font-bold uppercase tracking-widest transition-colors duration-150"
              style={
                active
                  ? { backgroundColor: "#000", color: "#fff" }
                  : undefined
              }
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#000";
                  (e.currentTarget as HTMLElement).style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "";
                  (e.currentTarget as HTMLElement).style.color = "";
                }
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-6 left-0 w-56 px-6">
        <Link
          href="/"
          className="text-xs text-black/40 uppercase tracking-widest hover:text-black transition-colors"
        >
          &larr; Back to site
        </Link>
      </div>
    </aside>
  );
}
