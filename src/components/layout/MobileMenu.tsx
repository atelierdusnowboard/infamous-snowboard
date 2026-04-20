"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useUIStore } from "@/lib/store/ui";
import { cn } from "@/lib/utils/cn";
import type { Category } from "@/lib/queries/categories";

interface MobileMenuProps {
  categories?: Category[];
}

export function MobileMenu({ categories = [] }: MobileMenuProps) {
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const staticLinks = [
    { href: "/blog", label: "Blog" },
    { href: "/account", label: "Account" },
    { href: "/account/wishlist", label: "Wishlist" },
    { href: "/cart", label: "Cart" },
  ];

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black text-white flex flex-col",
        "transition-transform duration-300 ease-in-out",
        mobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/20">
        <span className="text-xs font-bold uppercase tracking-widest text-white/60">Menu</span>
        <button
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
          className="text-white hover:opacity-60 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="square" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 flex flex-col justify-center px-8 gap-6">
        {/* Dynamic category links */}
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop/${cat.slug}`}
            onClick={() => setMobileMenuOpen(false)}
            className="text-3xl font-black uppercase tracking-wider text-white hover:opacity-60 transition-opacity"
          >
            {cat.name}
          </Link>
        ))}

        {/* Separator */}
        {categories.length > 0 && (
          <div className="border-t border-white/20 my-2" />
        )}

        {/* Static links */}
        {staticLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileMenuOpen(false)}
            className="text-xl font-bold uppercase tracking-wider text-white/60 hover:text-white hover:opacity-80 transition-opacity"
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-8 py-8 border-t border-white/20">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
          Less Noise. More Shapes.
        </p>
      </div>
    </div>
  );
}
