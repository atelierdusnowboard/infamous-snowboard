"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUIStore } from "@/lib/store/ui";
import { CartIcon } from "@/components/cart/CartIcon";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { toggleMobileMenu } = useUIStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-colors duration-200",
        scrolled
          ? "bg-black text-white border-b border-white/20"
          : "bg-white text-black border-b border-black"
      )}
    >
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo.png"
            alt="Infamous Snowboard"
            width={120}
            height={40}
            className={cn(
              "h-8 w-auto object-contain",
              scrolled ? "invert" : ""
            )}
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
          >
            Shop
          </Link>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
          >
            Boards
          </Link>
          <Link
            href="/blog"
            className="text-xs font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
          >
            Blog
          </Link>
          <Link
            href="/pro"
            className="text-xs font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
          >
            Pro
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Wishlist */}
          <Link
            href="/account/wishlist"
            className="hidden md:flex hover:opacity-60 transition-opacity"
            aria-label="Wishlist"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="square"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </Link>

          {/* Cart */}
          <CartIcon />

          {/* Account */}
          <Link
            href="/account"
            className="hidden md:flex hover:opacity-60 transition-opacity"
            aria-label="Account"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="square"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden hover:opacity-60 transition-opacity"
            aria-label="Open menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="square"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
